import google.generativeai as genai
from typing import List, Dict, Any

# Tool for 2D bounding box detection
detect_2d_boxes_tool = genai.protos.FunctionDeclaration(
    name="detect_2d_bounding_boxes",
    description="Detect objects in an image and return 2D bounding boxes with labels",
    parameters=genai.protos.Schema(
        type=genai.protos.Type.OBJECT,
        properties={
            "detections": genai.protos.Schema(
                type=genai.protos.Type.ARRAY,
                description="List of detected objects with 2D bounding boxes",
                items=genai.protos.Schema(
                    type=genai.protos.Type.OBJECT,
                    properties={
                        "box_2d": genai.protos.Schema(
                            type=genai.protos.Type.ARRAY,
                            description="2D bounding box coordinates as [ymin, xmin, ymax, xmax] in pixels (0-1000 scale)",
                            items=genai.protos.Schema(type=genai.protos.Type.NUMBER)
                        ),
                        "label": genai.protos.Schema(
                            type=genai.protos.Type.STRING,
                            description="Descriptive label for the detected object"
                        ),
                        "confidence": genai.protos.Schema(
                            type=genai.protos.Type.NUMBER,
                            description="Confidence score between 0 and 1"
                        )
                    },
                    required=["box_2d", "label"]
                )
            )
        },
        required=["detections"]
    )
)

# Tool for 3D bounding box detection
detect_3d_boxes_tool = genai.protos.FunctionDeclaration(
    name="detect_3d_bounding_boxes",
    description="Detect objects in an image and return 3D bounding boxes with spatial information",
    parameters=genai.protos.Schema(
        type=genai.protos.Type.OBJECT,
        properties={
            "detections": genai.protos.Schema(
                type=genai.protos.Type.ARRAY,
                description="List of detected objects with 3D bounding boxes",
                items=genai.protos.Schema(
                    type=genai.protos.Type.OBJECT,
                    properties={
                        "box_3d": genai.protos.Schema(
                            type=genai.protos.Type.ARRAY,
                            description="3D bounding box as [center_x, center_y, center_z, size_x, size_y, size_z, roll, pitch, yaw] where angles are in degrees",
                            items=genai.protos.Schema(type=genai.protos.Type.NUMBER)
                        ),
                        "label": genai.protos.Schema(
                            type=genai.protos.Type.STRING,
                            description="Descriptive label for the detected object"
                        ),
                        "confidence": genai.protos.Schema(
                            type=genai.protos.Type.NUMBER,
                            description="Confidence score between 0 and 1"
                        )
                    },
                    required=["box_3d", "label"]
                )
            )
        },
        required=["detections"]
    )
)

# Tool for segmentation masks
detect_segmentation_tool = genai.protos.FunctionDeclaration(
    name="detect_segmentation_masks",
    description="Detect objects in an image and return segmentation polygon coordinates",
    parameters=genai.protos.Schema(
        type=genai.protos.Type.OBJECT,
        properties={
            "detections": genai.protos.Schema(
                type=genai.protos.Type.ARRAY,
                description="List of detected objects with segmentation polygon coordinates",
                items=genai.protos.Schema(
                    type=genai.protos.Type.OBJECT,
                    properties={
                        "box_2d": genai.protos.Schema(
                            type=genai.protos.Type.ARRAY,
                            description="2D bounding box coordinates as [ymin, xmin, ymax, xmax] in pixels (0-1000 scale)",
                            items=genai.protos.Schema(type=genai.protos.Type.NUMBER)
                        ),
                        "polygon": genai.protos.Schema(
                            type=genai.protos.Type.ARRAY,
                            description="Segmentation polygon as array of [x, y] coordinate pairs in 0-1000 scale, tracing the object outline",
                            items=genai.protos.Schema(
                                type=genai.protos.Type.ARRAY,
                                items=genai.protos.Schema(type=genai.protos.Type.NUMBER)
                            )
                        ),
                        "label": genai.protos.Schema(
                            type=genai.protos.Type.STRING,
                            description="Descriptive label for the detected object"
                        ),
                        "confidence": genai.protos.Schema(
                            type=genai.protos.Type.NUMBER,
                            description="Confidence score between 0 and 1"
                        )
                    },
                    required=["box_2d", "polygon", "label"]
                )
            )
        },
        required=["detections"]
    )
)

# Tool for point detection
detect_points_tool = genai.protos.FunctionDeclaration(
    name="detect_key_points",
    description="Detect key points or landmarks in an image",
    parameters=genai.protos.Schema(
        type=genai.protos.Type.OBJECT,
        properties={
            "detections": genai.protos.Schema(
                type=genai.protos.Type.ARRAY,
                description="List of detected key points",
                items=genai.protos.Schema(
                    type=genai.protos.Type.OBJECT,
                    properties={
                        "point": genai.protos.Schema(
                            type=genai.protos.Type.ARRAY,
                            description="Point coordinates as [y, x] in pixels (0-1000 scale)",
                            items=genai.protos.Schema(type=genai.protos.Type.NUMBER)
                        ),
                        "label": genai.protos.Schema(
                            type=genai.protos.Type.STRING,
                            description="Descriptive label for the detected point"
                        ),
                        "confidence": genai.protos.Schema(
                            type=genai.protos.Type.NUMBER,
                            description="Confidence score between 0 and 1"
                        )
                    },
                    required=["point", "label"]
                )
            )
        },
        required=["detections"]
    )
)

# Create tools for each detection type
tools_2d = genai.protos.Tool(function_declarations=[detect_2d_boxes_tool])
tools_3d = genai.protos.Tool(function_declarations=[detect_3d_boxes_tool])
tools_segmentation = genai.protos.Tool(function_declarations=[detect_segmentation_tool])
tools_points = genai.protos.Tool(function_declarations=[detect_points_tool])

def get_tool_for_detection_type(detect_type: str) -> genai.protos.Tool:
    """Get the appropriate tool for the detection type"""
    if detect_type == "2D bounding boxes":
        return tools_2d
    elif detect_type == "3D bounding boxes":
        return tools_3d
    elif detect_type == "Segmentation masks":
        return tools_segmentation
    elif detect_type == "Points":
        return tools_points
    else:
        raise ValueError(f"Unknown detection type: {detect_type}")

def get_tool_prompt(detect_type: str, target_prompt: str, label_prompt: str = "", segmentation_language: str = "English") -> str:
    """Generate a prompt for the tool-based detection"""
    if detect_type == "2D bounding boxes":
        label_instruction = f" Label each detection with {label_prompt}." if label_prompt else " Provide descriptive labels."
        return f"Analyze this image and detect {target_prompt}. You MUST use the detect_2d_bounding_boxes function to return the results.{label_instruction} Call the function with your detections."
    
    elif detect_type == "3D bounding boxes":
        return f"Analyze this image and detect {target_prompt} with 3D spatial information. You MUST use the detect_3d_bounding_boxes function to return the results with estimated 3D positions, sizes, and orientations. Call the function with your detections."
    
    elif detect_type == "Segmentation masks":
        language_instruction = ""
        if segmentation_language.lower() != "english":
            language_instruction = f" Provide labels in {segmentation_language} language only."
        return f"Analyze this image and detect {target_prompt} with segmentation polygons. You MUST use the detect_segmentation_masks function to return the results.{language_instruction} For each object, provide the bounding box coordinates and a polygon outline that traces the exact shape of the object using coordinate pairs."
    
    elif detect_type == "Points":
        return f"Analyze this image and detect key points for {target_prompt}. You MUST use the detect_key_points function to return the results with point coordinates and descriptive labels. Call the function with your detections."
    
    return f"Analyze this image and detect {target_prompt}." 