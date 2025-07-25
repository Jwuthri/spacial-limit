from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Union
import google.generativeai as genai
import os
from dotenv import load_dotenv
import base64
import io
from PIL import Image, ImageDraw, ImageFont
import json
import time
from datetime import datetime
from sqlalchemy.orm import Session
import logging

# Import our custom modules
from database import get_db, create_tables, Prediction
from tools import get_tool_for_detection_type, get_tool_prompt

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

app = FastAPI(title="Spatial Understanding API", version="1.0.0")

# Configure CORS
origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Gemini API
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Create database tables on startup
create_tables()

def convert_image_to_png_base64(image_data: bytes, max_size: int = 800, skip_resize: bool = False) -> str:
    """
    Convert any image format to PNG and return as base64 string.
    
    Args:
        image_data: Raw image bytes in any format
        max_size: Maximum dimension for resizing (default 640px)
        
    Returns:
        Clean base64 string of PNG image
    """
    try:
        # Open image from bytes
        image = Image.open(io.BytesIO(image_data))
        original_format = image.format
        logger.info(f"Image loaded: {image.width}x{image.height}, format: {original_format}, mode: {image.mode}")
        
        # Convert to RGB mode for maximum compatibility
        # This handles RGBA, CMYK, LA, P (palette), 1 (bitmap), etc.
        if image.mode != 'RGB':
            logger.info(f"Converting image from {image.mode} to RGB")
            if image.mode in ('RGBA', 'LA'):
                # For images with transparency, create white background
                background = Image.new('RGB', image.size, (255, 255, 255))
                if image.mode == 'RGBA':
                    background.paste(image, mask=image.split()[-1])  # Use alpha channel as mask
                else:  # LA mode
                    background.paste(image, mask=image.split()[-1])
                image = background
            else:
                # For other modes (P, CMYK, 1, etc.), direct conversion
                image = image.convert('RGB')
        
        # Resize if needed (max dimension) and skip_resize is False
        if not skip_resize and (image.width > max_size or image.height > max_size):
            scale = min(max_size / image.width, max_size / image.height)
            new_width = int(image.width * scale)
            new_height = int(image.height * scale)
            image = image.resize((new_width, new_height), Image.Resampling.LANCZOS)
            logger.info(f"Image resized to: {new_width}x{new_height}")
        elif skip_resize:
            logger.info(f"Skipping backend resize (mobile already resized)")
        else:
            logger.info(f"Image size {image.width}x{image.height} is within max_size {max_size}, no resize needed")
        
        # Convert to PNG format
        buffered = io.BytesIO()
        image.save(buffered, format="PNG", optimize=True)
        img_base64 = base64.b64encode(buffered.getvalue()).decode()
        
        logger.info(f"Image converted: {original_format} -> PNG, base64 length: {len(img_base64)}")
        return img_base64
        
    except Exception as e:
        logger.error(f"Failed to convert image to PNG: {e}")
        raise e

def clean_base64_for_gemini(base64_string: str) -> str:
    """
    Ensure base64 string is clean for Gemini API by removing any data URL prefix.
    
    Args:
        base64_string: Base64 string that might contain data URL prefix
        
    Returns:
        Clean base64 string without any prefix
    """
    # Check if the string starts with a data URL prefix
    if base64_string.startswith('data:'):
        # Find the comma that separates the prefix from the base64 data
        comma_index = base64_string.find(',')
        if comma_index != -1:
            # Return everything after the comma
            clean_base64 = base64_string[comma_index + 1:]
            logger.info(f"Stripped data URL prefix. Original length: {len(base64_string)}, Clean length: {len(clean_base64)}")
            return clean_base64
        else:
            logger.warning("Found data: prefix but no comma, using original string")
            return base64_string
    
    return base64_string

# Models
class Point(BaseModel):
    x: float
    y: float

class BoundingBox2D(BaseModel):
    x: float
    y: float
    width: float
    height: float
    label: str
    confidence: Optional[float] = None

class BoundingBox3D(BaseModel):
    center: List[float]
    size: List[float]
    rpy: List[float]
    label: str
    confidence: Optional[float] = None

class SegmentationMask(BaseModel):
    x: float
    y: float
    width: float
    height: float
    label: str
    imageData: str
    confidence: Optional[float] = None

class DetectedPoint(BaseModel):
    point: Point
    label: str
    confidence: Optional[float] = None

class VisionRequest(BaseModel):
    detect_type: str
    target_prompt: Optional[str] = "items"
    label_prompt: Optional[str] = ""
    segmentation_language: Optional[str] = "English"
    temperature: Optional[float] = 0.4

class VisionResponse(BaseModel):
    success: bool
    data: Union[List[BoundingBox2D], List[BoundingBox3D], List[SegmentationMask], List[DetectedPoint]]
    error: Optional[str] = None
    prediction_id: Optional[int] = None

class PredictionHistory(BaseModel):
    id: int
    image_name: str
    detect_type: str
    target_prompt: str
    created_at: datetime
    processing_time: Optional[float]
    result_count: int

@app.get("/")
async def root():
    return {"message": "Spatial Understanding API with Tools & Database"}

@app.post("/analyze", response_model=VisionResponse)
async def analyze_image(
    file: UploadFile = File(...),
    detect_type: str = Form(...),
    target_prompt: str = Form("items"),
    label_prompt: str = Form(""),
    segmentation_language: str = Form("English"),
    temperature: float = Form(0.4),
    skip_resize: bool = Form(False),
    db: Session = Depends(get_db)
):
    start_time = time.time()
    logger.info(f"Starting analysis: {detect_type} for '{target_prompt}'")
    
    try:
        # Read and convert image to PNG
        image_data = await file.read()
        img_base64 = convert_image_to_png_base64(image_data, skip_resize=skip_resize)
        
        # Choose model based on detection type
        model_name = "gemini-2.0-flash" if detect_type == "3D bounding boxes" else "gemini-2.5-flash"
        logger.info(f"Using model: {model_name}")
        
        # For segmentation masks, skip function calling and go straight to prompt engineering
        # as the original Google code shows this works better for masks
        if detect_type == "Segmentation masks":
            logger.info("Using prompt engineering for segmentation masks (like original)...")
            result = await analyze_with_prompt_engineering(
                img_base64, detect_type, target_prompt, label_prompt, 
                segmentation_language, temperature, model_name
            )
            formatted_data = result
            logger.info(f"Prompt engineering succeeded with {len(formatted_data)} detections")
        else:
            # Try function calling first for other detection types
            try:
                logger.info("Attempting function calling approach...")
                result = await analyze_with_function_calling(
                    img_base64, detect_type, target_prompt, label_prompt, 
                    segmentation_language, temperature, model_name
                )
                formatted_data = result
                logger.info(f"Function calling succeeded with {len(formatted_data)} detections")
            except Exception as func_error:
                logger.warning(f"Function calling failed: {func_error}")
                logger.info("Falling back to prompt engineering...")
                # Fallback to prompt engineering
                result = await analyze_with_prompt_engineering(
                    img_base64, detect_type, target_prompt, label_prompt, 
                    segmentation_language, temperature, model_name
                )
                formatted_data = result
                logger.info(f"Prompt engineering succeeded with {len(formatted_data)} detections")
        
        # Calculate processing time
        processing_time = time.time() - start_time
        logger.info(f"Analysis completed in {processing_time:.2f}s")
        
        # Save to database
        prediction = Prediction(
            image_name=file.filename or "unknown",
            image_data=f"data:image/png;base64,{img_base64}",
            detect_type=detect_type,
            target_prompt=target_prompt,
            label_prompt=label_prompt,
            segmentation_language=segmentation_language,
            temperature=temperature,
            model_used=model_name,
            results=formatted_data,
            processing_time=processing_time
        )
        db.add(prediction)
        db.commit()
        db.refresh(prediction)
        logger.info(f"Saved prediction to database with ID: {prediction.id}")
        
        return VisionResponse(
            success=True, 
            data=formatted_data, 
            prediction_id=prediction.id
        )
        
    except Exception as e:
        processing_time = time.time() - start_time
        logger.error(f"Analysis failed after {processing_time:.2f}s: {str(e)}")
        
        # Save failed prediction to database
        try:
            prediction = Prediction(
                image_name=file.filename or "unknown",
                image_data=f"data:image/png;base64,{img_base64}",
                detect_type=detect_type,
                target_prompt=target_prompt,
                label_prompt=label_prompt,
                segmentation_language=segmentation_language,
                temperature=temperature,
                model_used=model_name,
                results=[],
                processing_time=processing_time
            )
            db.add(prediction)
            db.commit()
            logger.info("Saved failed prediction to database")
        except:
            logger.error("Failed to save failed prediction to database")
        
        return VisionResponse(success=False, data=[], error=str(e))

@app.post("/analyze-with-overlay")
async def analyze_image_with_overlay(
    file: UploadFile = File(...),
    detect_type: str = Form(...),
    target_prompt: str = Form("items"),
    label_prompt: str = Form(""),
    segmentation_language: str = Form("English"),
    temperature: float = Form(0.4),
    skip_resize: bool = Form(False),
    db: Session = Depends(get_db)
):
    """Analyze image and return the image with bounding boxes/masks drawn on it"""
    start_time = time.time()
    logger.info(f"Starting analysis with overlay: {detect_type} for '{target_prompt}'")
    
    try:
        # Read and convert image to PNG
        image_data = await file.read()
        img_base64 = convert_image_to_png_base64(image_data, skip_resize=skip_resize)
        
        # Choose model based on detection type
        model_name = "gemini-2.0-flash" if detect_type == "3D bounding boxes" else "gemini-2.5-flash"
        logger.info(f"Using model: {model_name}")
        
        # Get analysis results (same logic as regular analyze endpoint)
        if detect_type == "Segmentation masks":
            logger.info("Using prompt engineering for segmentation masks...")
            result = await analyze_with_prompt_engineering(
                img_base64, detect_type, target_prompt, label_prompt, 
                segmentation_language, temperature, model_name
            )
            formatted_data = result
        else:
            try:
                logger.info("Attempting function calling approach...")
                result = await analyze_with_function_calling(
                    img_base64, detect_type, target_prompt, label_prompt, 
                    segmentation_language, temperature, model_name
                )
                formatted_data = result
            except Exception as func_error:
                logger.warning(f"Function calling failed: {func_error}")
                logger.info("Falling back to prompt engineering...")
                result = await analyze_with_prompt_engineering(
                    img_base64, detect_type, target_prompt, label_prompt, 
                    segmentation_language, temperature, model_name
                )
                formatted_data = result
        
        # Create image with overlays
        overlay_image_base64 = create_image_with_overlays(img_base64, formatted_data, detect_type)
        
        # Calculate processing time
        processing_time = time.time() - start_time
        logger.info(f"Analysis with overlay completed in {processing_time:.2f}s")
        
        # Save to database
        prediction = Prediction(
            image_name=file.filename or "unknown",
            image_data=f"data:image/png;base64,{img_base64}",
            detect_type=detect_type,
            target_prompt=target_prompt,
            label_prompt=label_prompt,
            segmentation_language=segmentation_language,
            temperature=temperature,
            model_used=f"{model_name} (with overlay)",
            results=formatted_data,
            processing_time=processing_time
        )
        db.add(prediction)
        db.commit()
        db.refresh(prediction)
        logger.info(f"Saved prediction to database with ID: {prediction.id}")
        
        return {
            "success": True,
            "data": formatted_data,
            "overlay_image": f"data:image/png;base64,{overlay_image_base64}",
            "prediction_id": prediction.id
        }
        
    except Exception as e:
        processing_time = time.time() - start_time
        logger.error(f"Analysis with overlay failed after {processing_time:.2f}s: {str(e)}")
        return {
            "success": False,
            "data": [],
            "error": str(e)
        }

async def analyze_with_function_calling(
    img_base64: str, detect_type: str, target_prompt: str, 
    label_prompt: str, segmentation_language: str, temperature: float, model_name: str
):
    """Try analysis with function calling tools"""
    logger.info(f"Setting up function calling for {detect_type}")
    
    # Get the appropriate tool and prompt
    tool = get_tool_for_detection_type(detect_type)
    prompt = get_tool_prompt(detect_type, target_prompt, label_prompt, segmentation_language)
    
    logger.info(f"Tool: {tool.function_declarations[0].name}")
    logger.info(f"Prompt: {prompt}")
    
    model = genai.GenerativeModel(model_name, tools=[tool])
    
    # Generate content with tools
    generation_config = genai.types.GenerationConfig(
        temperature=temperature
    )
    
    if detect_type != "3D bounding boxes":
        generation_config.thinking_budget = 0
    
    logger.info("Sending request to Gemini...")
    response = model.generate_content(
        [
            {
                "mime_type": "image/png",
                "data": img_base64
            },
            prompt
        ],
        generation_config=generation_config
    )
    
    logger.info("Received response from Gemini")
    logger.info(f"Response candidates: {len(response.candidates) if response.candidates else 0}")
    
    # Extract function call results
    if response.candidates and len(response.candidates) > 0:
        candidate = response.candidates[0]
        logger.info(f"Candidate finish_reason: {candidate.finish_reason}")
        
        if candidate.content and candidate.content.parts:
            logger.info(f"Content parts: {len(candidate.content.parts)}")
            
            for i, part in enumerate(candidate.content.parts):
                logger.info(f"Part {i}: type = {type(part)}")
                
                # Check different ways to access function call
                if hasattr(part, 'function_call') and part.function_call:
                    function_call = part.function_call
                    logger.info(f"Function call found: {function_call.name}")
                    logger.info(f"Function call args type: {type(function_call.args)}")
                    
                    try:
                        # Try different ways to get the args
                        if hasattr(function_call.args, 'get'):
                            # Dictionary-like access
                            detections = function_call.args.get('detections', [])
                            logger.info(f"Got detections via .get(): {len(detections)}")
                        elif hasattr(function_call.args, 'detections'):
                            # Direct attribute access
                            detections = function_call.args.detections
                            logger.info(f"Got detections via attribute: {len(detections)}")
                        else:
                            # Convert to dict if possible
                            args_dict = dict(function_call.args)
                            detections = args_dict.get('detections', [])
                            logger.info(f"Got detections via dict conversion: {len(detections)}")
                        
                        # Format response based on detection type
                        result = format_tool_response(detect_type, detections)
                        logger.info(f"Formatted {len(result)} detections")
                        return result
                        
                    except Exception as parse_error:
                        logger.error(f"Error parsing function call args: {parse_error}")
                        logger.error(f"Args object: {function_call.args}")
                        raise parse_error
                        
                elif hasattr(part, 'text') and part.text:
                    logger.info(f"Text part found: {part.text[:100]}...")
                else:
                    logger.info(f"Other part type: {part}")
    
    # If we get here, no function call was found
    logger.warning("No function call found in response")
    
    # Log the full response for debugging
    if response.candidates:
        for i, candidate in enumerate(response.candidates):
            logger.info(f"Candidate {i} content: {candidate.content}")
    
    raise Exception("No function call found in response")

async def analyze_with_prompt_engineering(
    img_base64: str, detect_type: str, target_prompt: str, 
    label_prompt: str, segmentation_language: str, temperature: float, model_name: str
):
    """Fallback to prompt engineering if function calling fails"""
    logger.info(f"Using prompt engineering fallback for {detect_type}")
    
    model = genai.GenerativeModel(model_name)
    
    # Generate prompt based on detection type (fallback)
    prompt = generate_fallback_prompt(detect_type, target_prompt, label_prompt, segmentation_language)
    logger.info(f"Fallback prompt: {prompt}")
    
    generation_config = genai.types.GenerationConfig(
        temperature=temperature
    )
    
    if detect_type != "3D bounding boxes":
        generation_config.thinking_budget = 0
    
    logger.info("Sending fallback request to Gemini...")
    # Clean base64 data to ensure it doesn't have any data URL prefix
    clean_base64 = clean_base64_for_gemini(img_base64)
    response = model.generate_content(
        [
            {
                "mime_type": "image/png",
                "data": clean_base64
            },
            prompt
        ],
        generation_config=generation_config
    )
    
    logger.info("Received fallback response from Gemini")
    
    # Parse response
    response_text = response.text
    logger.info(f"Response text length: {len(response_text)}")
    
    if "```json" in response_text:
        response_text = response_text.split("```json")[1].split("```")[0]
        logger.info("Extracted JSON from markdown block")
    
    try:
        parsed_response = json.loads(response_text)
        logger.info(f"Parsed JSON with {len(parsed_response)} items")
    except json.JSONDecodeError as e:
        logger.error(f"JSON parsing failed: {e}")
        logger.error(f"Response text: {response_text[:500]}...")
        raise e
    
    # Format response based on detection type
    result = format_prompt_response(detect_type, parsed_response)
    logger.info(f"Formatted {len(result)} detections from prompt engineering")
    return result

def generate_fallback_prompt(detect_type: str, target_prompt: str, label_prompt: str, segmentation_language: str) -> str:
    """Generate fallback prompts for when function calling fails"""
    if detect_type == "2D bounding boxes":
        label_text = label_prompt or "a text label"
        return f"Detect {target_prompt}, with no more than 20 items. Output a json list where each entry contains the 2D bounding box in \"box_2d\" and {label_text} in \"label\"."
    
    elif detect_type == "Segmentation masks":
        language_instruction = ""
        if segmentation_language.lower() != "english":
            language_instruction = f" Use descriptive labels in {segmentation_language}."
        else:
            language_instruction = " Use descriptive labels."
        
        return f"""Detect and segment {target_prompt} in this image. For each object, provide:
1. A precise 2D bounding box as [ymin, xmin, ymax, xmax] in 0-1000 pixel coordinates
2. A base64 encoded PNG segmentation mask showing the exact object shape
3. A descriptive text label{language_instruction}

Output a JSON list where each entry contains:
- "box_2d": [ymin, xmin, ymax, xmax] coordinates  
- "mask": base64 encoded PNG image of the segmentation mask
- "label": descriptive text label

IMPORTANT: The mask must be a valid base64 encoded PNG image showing the exact shape of the detected objects."""
    
    elif detect_type == "Points":
        return f"Detect {target_prompt} and mark key points. Output a json list where each entry contains the point coordinates in \"point\" and a text label in \"label\"."
    
    elif detect_type == "3D bounding boxes":
        return f"Detect {target_prompt} and create 3D bounding boxes. Output a json list where each entry contains the 3D bounding box in \"box_3d\" (9 values: center_x, center_y, center_z, size_x, size_y, size_z, roll, pitch, yaw in degrees) and a text label in \"label\"."
    
    return f"Detect {target_prompt}."

def format_tool_response(detect_type: str, detections: List[dict]) -> List[dict]:
    """Format the tool response to match frontend expectations"""
    logger.info(f"Formatting tool response for {detect_type} with {len(detections)} detections")
    
    if detect_type == "2D bounding boxes":
        return [
            {
                "x": detection["box_2d"][1] / 1000,
                "y": detection["box_2d"][0] / 1000,
                "width": (detection["box_2d"][3] - detection["box_2d"][1]) / 1000,
                "height": (detection["box_2d"][2] - detection["box_2d"][0]) / 1000,
                "label": detection["label"],
                "confidence": detection.get("confidence")
            }
            for detection in detections
        ]
    
    elif detect_type == "Points":
        return [
            {
                "point": {
                    "x": detection["point"][1] / 1000,
                    "y": detection["point"][0] / 1000
                },
                "label": detection["label"],
                "confidence": detection.get("confidence")
            }
            for detection in detections
        ]
    
    elif detect_type == "Segmentation masks":
        formatted = []
        for i, detection in enumerate(detections):
            polygon_data = detection.get("polygon", [])
            logger.info(f"Detection {i}: polygon points = {len(polygon_data)}")
            
            # Convert polygon coordinates from 0-1000 scale to 0-1 scale
            normalized_polygon = []
            if polygon_data:
                for point in polygon_data:
                    if len(point) >= 2:
                        normalized_polygon.append([point[0] / 1000, point[1] / 1000])
            
            # If no polygon data, create a simple rectangle polygon
            if not normalized_polygon:
                logger.warning(f"No polygon data for detection {i}, creating rectangle polygon")
                x1, y1 = detection["box_2d"][1] / 1000, detection["box_2d"][0] / 1000
                x2, y2 = detection["box_2d"][3] / 1000, detection["box_2d"][2] / 1000
                normalized_polygon = [[x1, y1], [x2, y1], [x2, y2], [x1, y2]]
            
            formatted_detection = {
                "x": detection["box_2d"][1] / 1000,
                "y": detection["box_2d"][0] / 1000,
                "width": (detection["box_2d"][3] - detection["box_2d"][1]) / 1000,
                "height": (detection["box_2d"][2] - detection["box_2d"][0]) / 1000,
                "label": detection["label"],
                "polygon": normalized_polygon,
                "confidence": detection.get("confidence")
            }
            formatted.append(formatted_detection)
        
        # Sort largest to smallest
        return sorted(formatted, key=lambda x: x["width"] * x["height"], reverse=True)
    
    elif detect_type == "3D bounding boxes":
        return [
            {
                "center": detection["box_3d"][:3],
                "size": detection["box_3d"][3:6],
                "rpy": [x * 3.14159 / 180 for x in detection["box_3d"][6:]],
                "label": detection["label"],
                "confidence": detection.get("confidence")
            }
            for detection in detections
        ]
    
    return detections

def format_prompt_response(detect_type: str, parsed_response: List[dict]) -> List[dict]:
    """Format the prompt response to match frontend expectations"""
    logger.info(f"Formatting prompt response for {detect_type} with {len(parsed_response)} items")
    
    if detect_type == "2D bounding boxes":
        return [
            {
                "x": box["box_2d"][1] / 1000,
                "y": box["box_2d"][0] / 1000,
                "width": (box["box_2d"][3] - box["box_2d"][1]) / 1000,
                "height": (box["box_2d"][2] - box["box_2d"][0]) / 1000,
                "label": box["label"]
            }
            for box in parsed_response
        ]
    
    elif detect_type == "Points":
        return [
            {
                "point": {
                    "x": point["point"][1] / 1000,
                    "y": point["point"][0] / 1000
                },
                "label": point["label"]
            }
            for point in parsed_response
        ]
    
    elif detect_type == "Segmentation masks":
        formatted = []
        for i, box in enumerate(parsed_response):
            mask_data = box.get("mask", "")
            logger.info(f"Prompt response {i}: mask data length = {len(mask_data)}, has_mask = {bool(mask_data)}")
            if mask_data:
                logger.info(f"Prompt response {i}: mask data preview = {mask_data[:50]}...")
            
            formatted_detection = {
                "x": box["box_2d"][1] / 1000,
                "y": box["box_2d"][0] / 1000,
                "width": (box["box_2d"][3] - box["box_2d"][1]) / 1000,
                "height": (box["box_2d"][2] - box["box_2d"][0]) / 1000,
                "label": box["label"],
                "imageData": mask_data
            }
            formatted.append(formatted_detection)
        
        # Sort largest to smallest
        return sorted(formatted, key=lambda x: x["width"] * x["height"], reverse=True)
    
    elif detect_type == "3D bounding boxes":
        return [
            {
                "center": box["box_3d"][:3],
                "size": box["box_3d"][3:6],
                "rpy": [x * 3.14159 / 180 for x in box["box_3d"][6:]],
                "label": box["label"]
            }
            for box in parsed_response
        ]
    
    return parsed_response

def create_image_with_overlays(img_base64: str, detections: List[dict], detect_type: str) -> str:
    """Draw bounding boxes or overlays on the image and return as base64"""
    try:
        # Decode base64 image
        img_data = base64.b64decode(img_base64)
        image = Image.open(io.BytesIO(img_data))
        
        # Convert to RGBA for overlay support
        if image.mode != 'RGBA':
            image = image.convert('RGBA')
        
        # Create overlay layer
        overlay = Image.new('RGBA', image.size, (255, 255, 255, 0))
        draw = ImageDraw.Draw(overlay)
        
        # Define colors for different detections
        colors = [
            (255, 0, 0, 180),    # Red
            (0, 255, 0, 180),    # Green  
            (0, 0, 255, 180),    # Blue
            (255, 255, 0, 180),  # Yellow
            (255, 0, 255, 180),  # Magenta
            (0, 255, 255, 180),  # Cyan
            (255, 128, 0, 180),  # Orange
            (128, 0, 255, 180),  # Purple
        ]
        
        logger.info(f"Drawing {len(detections)} {detect_type} on {image.width}x{image.height} image")
        
        # Draw overlays based on detection type
        for i, detection in enumerate(detections):
            color = colors[i % len(colors)]
            
            if detect_type == "2D bounding boxes":
                draw_2d_bounding_box(draw, detection, color, image.width, image.height, i)
            elif detect_type == "Points":
                draw_point(draw, detection, color, image.width, image.height, i)
            elif detect_type == "Segmentation masks":
                draw_segmentation_mask(draw, detection, color, image.width, image.height, i)
            # 3D bounding boxes would need special handling - skip for now
        
        # Composite overlay onto original image
        result_image = Image.alpha_composite(image, overlay)
        
        # Convert back to RGB for PNG saving
        if result_image.mode == 'RGBA':
            # Create white background
            background = Image.new('RGB', result_image.size, (255, 255, 255))
            background.paste(result_image, mask=result_image.split()[-1])  # Use alpha as mask
            result_image = background
        
        # Convert back to base64
        buffered = io.BytesIO()
        result_image.save(buffered, format="PNG", optimize=True)
        result_base64 = base64.b64encode(buffered.getvalue()).decode()
        
        logger.info(f"Created overlay image, base64 length: {len(result_base64)}")
        return result_base64
        
    except Exception as e:
        logger.error(f"Failed to create image with overlays: {e}")
        # Return original image if overlay fails
        return img_base64

def draw_2d_bounding_box(draw: ImageDraw.Draw, detection: dict, color: tuple, img_width: int, img_height: int, index: int):
    """Draw a 2D bounding box on the image"""
    try:
        # Convert normalized coordinates (0-1) to pixels
        left = int(detection['x'] * img_width)
        top = int(detection['y'] * img_height)
        width = int(detection['width'] * img_width)
        height = int(detection['height'] * img_height)
        
        right = left + width
        bottom = top + height
        
        # Draw rectangle
        draw.rectangle([left, top, right, bottom], outline=color[:3] + (255,), width=3)
        
        # Draw label background
        label = detection.get('label', f'Item {index}')
        try:
            # Try to load a font, fallback to default if not available
            font = ImageFont.load_default()
        except:
            font = None
            
        # Get text size
        if font:
            bbox = draw.textbbox((0, 0), label, font=font)
            text_width = bbox[2] - bbox[0]
            text_height = bbox[3] - bbox[1]
        else:
            text_width = len(label) * 6  # Approximate
            text_height = 11
        
        # Draw label background
        label_bg = [left, top - text_height - 4, left + text_width + 8, top]
        draw.rectangle(label_bg, fill=color[:3] + (200,))
        
        # Draw label text
        draw.text((left + 4, top - text_height - 2), label, fill=(255, 255, 255, 255), font=font)
        
        logger.info(f"Drew box {index}: {label} at ({left},{top}) size {width}x{height}")
        
    except Exception as e:
        logger.error(f"Failed to draw bounding box {index}: {e}")

def draw_point(draw: ImageDraw.Draw, detection: dict, color: tuple, img_width: int, img_height: int, index: int):
    """Draw a point on the image"""
    try:
        # Handle both formats: {x, y} or {point: {x, y}}
        if 'point' in detection:
            x = detection['point']['x'] * img_width
            y = detection['point']['y'] * img_height
        else:
            x = detection['x'] * img_width
            y = detection['y'] * img_height
        
        # Draw circle
        radius = 8
        draw.ellipse([x-radius, y-radius, x+radius, y+radius], fill=color, outline=(255, 255, 255, 255), width=2)
        
        # Draw label
        label = detection.get('label', f'Point {index}')
        try:
            font = ImageFont.load_default()
        except:
            font = None
            
        draw.text((x + radius + 2, y - 6), label, fill=(255, 255, 255, 255), font=font)
        
        logger.info(f"Drew point {index}: {label} at ({x:.1f},{y:.1f})")
        
    except Exception as e:
        logger.error(f"Failed to draw point {index}: {e}")

def draw_segmentation_mask(draw: ImageDraw.Draw, detection: dict, color: tuple, img_width: int, img_height: int, index: int):
    """Draw segmentation mask on the image"""
    try:
        # For now, just draw bounding box for segmentation (could enhance with actual mask later)
        draw_2d_bounding_box(draw, detection, color, img_width, img_height, index)
        
        # If there's actual mask data, we could decode and overlay it here
        # mask_data = detection.get('imageData') or detection.get('mask')
        # if mask_data:
        #     # Decode and overlay the actual mask
        #     pass
            
    except Exception as e:
        logger.error(f"Failed to draw segmentation mask {index}: {e}")

def generate_fallback_mask(xmin: int, ymin: int, xmax: int, ymax: int) -> str:
    """Generate a simple rectangular mask when Gemini doesn't provide one"""
    try:
        from PIL import Image, ImageDraw
        import base64
        import io
        
        # Create a mask image (100x100 is sufficient for a simple rectangle)
        width = max(100, xmax - xmin)
        height = max(100, ymax - ymin)
        
        # Create a black image
        mask_img = Image.new('L', (width, height), 0)  # 'L' mode for grayscale
        draw = ImageDraw.Draw(mask_img)
        
        # Draw a white rectangle (the mask)
        draw.rectangle([10, 10, width-10, height-10], fill=255)
        
        # Convert to base64
        buffer = io.BytesIO()
        mask_img.save(buffer, format='PNG')
        mask_base64 = base64.b64encode(buffer.getvalue()).decode()
        
        logger.info(f"Generated fallback mask: {width}x{height}, base64 length: {len(mask_base64)}")
        return mask_base64
        
    except Exception as e:
        logger.error(f"Failed to generate fallback mask: {e}")
        return ""

@app.get("/history", response_model=List[PredictionHistory])
async def get_prediction_history(
    limit: int = 50,
    detect_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get prediction history with optional filtering"""
    query = db.query(Prediction)
    
    if detect_type:
        query = query.filter(Prediction.detect_type == detect_type)
    
    predictions = query.order_by(Prediction.created_at.desc()).limit(limit).all()
    
    return [
        PredictionHistory(
            id=p.id,
            image_name=p.image_name,
            detect_type=p.detect_type,
            target_prompt=p.target_prompt,
            created_at=p.created_at,
            processing_time=p.processing_time,
            result_count=len(p.results) if p.results else 0
        )
        for p in predictions
    ]

@app.get("/prediction/{prediction_id}")
async def get_prediction(prediction_id: int, db: Session = Depends(get_db)):
    """Get a specific prediction with full details"""
    prediction = db.query(Prediction).filter(Prediction.id == prediction_id).first()
    
    if not prediction:
        raise HTTPException(status_code=404, detail="Prediction not found")
    
    return {
        "id": prediction.id,
        "image_name": prediction.image_name,
        "image_data": prediction.image_data,
        "detect_type": prediction.detect_type,
        "target_prompt": prediction.target_prompt,
        "label_prompt": prediction.label_prompt,
        "segmentation_language": prediction.segmentation_language,
        "temperature": prediction.temperature,
        "model_used": prediction.model_used,
        "results": prediction.results,
        "created_at": prediction.created_at,
        "processing_time": prediction.processing_time
    }

@app.delete("/prediction/{prediction_id}")
async def delete_prediction(prediction_id: int, db: Session = Depends(get_db)):
    """Delete a specific prediction"""
    prediction = db.query(Prediction).filter(Prediction.id == prediction_id).first()
    
    if not prediction:
        raise HTTPException(status_code=404, detail="Prediction not found")
    
    db.delete(prediction)
    db.commit()
    
    return {"message": "Prediction deleted successfully"}

@app.post("/save-analysis")
async def save_analysis(
    file: UploadFile = File(...),
    detect_type: str = Form(...),
    target_prompt: str = Form("items"),
    label_prompt: str = Form(""),
    segmentation_language: str = Form("English"),
    temperature: float = Form(0.4),
    results: str = Form(...),  # JSON string of results
    db: Session = Depends(get_db)
):
    """Save analysis results from direct Gemini API call to database"""
    start_time = time.time()
    logger.info(f"Saving analysis results: {detect_type} for '{target_prompt}'")
    
    try:
        # Read and convert image to PNG
        image_data = await file.read()
        img_base64 = convert_image_to_png_base64(image_data)  # Use default resize behavior for save endpoint
        
        # Parse results JSON
        try:
            parsed_results = json.loads(results)
            logger.info(f"Parsed {len(parsed_results)} results from client")
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse results JSON: {e}")
            raise HTTPException(status_code=400, detail="Invalid results JSON")
        
        # Calculate processing time (just for the save operation)
        processing_time = time.time() - start_time
        
        # Choose model name (same logic as analyze endpoint)
        model_name = "gemini-2.0-flash" if detect_type == "3D bounding boxes" else "gemini-2.5-flash"
        
        # Save to database
        prediction = Prediction(
            image_name=file.filename or "unknown",
            image_data=f"data:image/png;base64,{img_base64}",
            detect_type=detect_type,
            target_prompt=target_prompt,
            label_prompt=label_prompt,
            segmentation_language=segmentation_language,
            temperature=temperature,
            model_used=f"{model_name} (direct)",
            results=parsed_results,
            processing_time=processing_time
        )
        db.add(prediction)
        db.commit()
        db.refresh(prediction)
        logger.info(f"Saved analysis to database with ID: {prediction.id}")
        
        return {
            "success": True,
            "prediction_id": prediction.id,
            "message": "Analysis saved to database successfully"
        }
        
    except Exception as e:
        processing_time = time.time() - start_time
        logger.error(f"Failed to save analysis after {processing_time:.2f}s: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)