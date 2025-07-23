# Spatial Understanding Backend

Python FastAPI backend for spatial understanding and computer vision analysis using Google's Gemini API.

## Setup

1. **Install Python dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Environment Setup:**
   ```bash
   cp .env.example .env
   # Edit .env and add your Gemini API key
   ```

3. **Get Gemini API Key:**
   - Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Create a new API key
   - Add it to your `.env` file:
     ```
     GEMINI_API_KEY=your_actual_api_key_here
     CORS_ORIGINS=http://localhost:3000
     ```

4. **Run the server:**
   ```bash
   python main.py
   ```

   Or with uvicorn:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

The API will be available at `http://localhost:8000`

## API Endpoints

### POST /analyze
Analyze an image for spatial understanding.

**Parameters:**
- `file`: Image file (multipart/form-data)
- `detect_type`: Detection type ("2D bounding boxes", "Segmentation masks", "Points", "3D bounding boxes")
- `target_prompt`: What to detect (default: "items")
- `label_prompt`: How to label items (optional)
- `segmentation_language`: Language for segmentation labels (default: "English")
- `temperature`: Model temperature (default: 0.4)

**Response:**
```json
{
  "success": true,
  "data": [...],
  "error": null
}
```

### GET /
Health check endpoint.

## Features

- **2D Bounding Boxes**: Detect objects with rectangular bounding boxes
- **3D Bounding Boxes**: Detect objects with 3D spatial information
- **Segmentation Masks**: Detect objects with pixel-level masks
- **Points**: Detect key points or landmarks
- **Multi-language Support**: Segmentation labels in different languages
- **Temperature Control**: Adjust model creativity/randomness

## Models Used

- **Gemini 2.5 Flash**: For 2D bounding boxes, segmentation masks, and points
- **Gemini 2.0 Flash**: For 3D bounding boxes (better spatial understanding)

## Error Handling

The API includes comprehensive error handling for:
- Invalid image formats
- Missing API keys
- Model API errors
- JSON parsing errors 