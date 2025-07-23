# Spatial Understanding

A full-stack application for AI-powered spatial understanding and computer vision analysis. Upload images and get intelligent analysis including object detection, segmentation masks, key points, and 3D bounding boxes using Google's Gemini AI models with **structured function calling** and **persistent history**.

## 🆕 Latest Features

### **✅ Gemini Function Calling Tools**
- **Structured Output**: Uses Gemini's function calling instead of prompt engineering
- **Reliable Results**: Schema-enforced JSON responses with confidence scores
- **Better Accuracy**: Tools provide cleaner, more consistent detection results

### **✅ SQLite Database & History**
- **Persistent Storage**: All predictions saved with images and metadata
- **Full History**: Browse, filter, and reload previous predictions
- **Performance Tracking**: Processing times and model usage statistics
- **Easy Management**: Load previous results or delete unwanted predictions

## Architecture

- **Backend**: Python FastAPI with Google Gemini API integration + SQLite database
- **Frontend**: Next.js with TypeScript and modern React components
- **AI Models**: Gemini 2.5 Flash and Gemini 2.0 Flash with function calling tools

## Features

### Detection Types
🔍 **2D Bounding Boxes**: Detect objects with rectangular bounds  
🎯 **Points**: Identify key points and landmarks  
🎨 **Segmentation Masks**: Pixel-level object segmentation  
📦 **3D Bounding Boxes**: 3D spatial object detection  

### New Capabilities
- **Function Calling Tools**: Structured output with confidence scores
- **Prediction History**: View and reload previous analyses
- **Database Storage**: Persistent storage of all predictions
- **Performance Metrics**: Track processing times and accuracy
- **Multi-language Support**: Segmentation labels in any language
- **Temperature Control**: Adjust AI creativity and randomness
- **Real-time Visualization**: Interactive detection results
- **Drag & Drop Upload**: Easy image input
- **Responsive Design**: Works on desktop and mobile

## Quick Start

### Prerequisites
- Python 3.8+
- Node.js 18+
- Google AI Studio API key ([Get one here](https://aistudio.google.com/app/apikey))

### 1. Clone the Repository
```bash
git clone <repository-url>
cd spatial-understanding
```

### 2. Setup Backend
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
python main.py
```

### 3. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

### 4. Open Application
Visit [http://localhost:3000](http://localhost:3000)

## 🚀 Easy Startup

### **Unix/Linux/macOS:**
```bash
./run.sh
```

### **Windows:**
```cmd
run.bat
```

## Usage

1. **Upload an Image**: Drag and drop or click to select an image
2. **Choose Detection Type**: Select from 2D boxes, 3D boxes, segmentation, or points
3. **Configure Prompt**: Describe what you want to detect
4. **Adjust Settings**: Set temperature and language preferences
5. **Analyze**: Click "Analyze Image" to get AI-powered results
6. **View Results**: See detection results overlaid on your image
7. **Browse History**: Click "History" to view and reload previous predictions

## API Documentation

### Backend Endpoints

#### `POST /analyze`
Main analysis endpoint for image processing with function calling tools.

**Request:**
- `file`: Image file (JPG, PNG, etc.)
- `detect_type`: Detection type
- `target_prompt`: What to detect
- `label_prompt`: How to label results
- `segmentation_language`: Language for labels
- `temperature`: Model temperature (0.0-2.0)

**Response:**
```json
{
  "success": true,
  "data": [...detection results with confidence scores...],
  "error": null,
  "prediction_id": 123
}
```

#### `GET /history`
Get prediction history with optional filtering.

**Query Parameters:**
- `limit`: Max results (default: 50)
- `detect_type`: Filter by detection type

#### `GET /prediction/{id}`
Get full details of a specific prediction including image data.

#### `DELETE /prediction/{id}`
Delete a specific prediction from the database.

## Database Schema

The SQLite database stores:
- **Images**: Base64 encoded with metadata
- **Parameters**: All detection settings used
- **Results**: Complete detection output with confidence scores
- **Performance**: Processing times and model information
- **Timestamps**: When each prediction was made

## Configuration

### Backend (.env)
```bash
GEMINI_API_KEY=your_gemini_api_key_here
CORS_ORIGINS=http://localhost:3000
```

### Frontend (.env.local)
```bash
BACKEND_URL=http://localhost:8000
```

## Development

### Backend Development
```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend Development
```bash
cd frontend
npm run dev
```

## Function Calling vs Prompt Engineering

### **Before (Prompt Engineering):**
- ❌ Unreliable JSON parsing
- ❌ Inconsistent output format
- ❌ No confidence scores
- ❌ Manual error handling

### **After (Function Calling Tools):**
- ✅ Schema-enforced responses
- ✅ Structured output guaranteed
- ✅ Confidence scores included
- ✅ Automatic validation

## Models Used

- **Gemini 2.5 Flash**: Optimized for 2D detection, segmentation, and points with function calling
- **Gemini 2.0 Flash**: Enhanced 3D spatial understanding capabilities with function calling

## Project Structure

```
spatial-understanding/
├── backend/                 # Python FastAPI backend
│   ├── main.py             # Main application with tools integration
│   ├── database.py         # SQLAlchemy models and connection
│   ├── tools.py            # Gemini function calling tools
│   ├── requirements.txt    # Python dependencies
│   └── predictions.db      # SQLite database (auto-created)
├── frontend/               # Next.js frontend
│   ├── app/               # Next.js app directory
│   ├── components/        # React components + HistoryPanel
│   ├── lib/              # Utilities and types
│   └── package.json      # Node dependencies
├── run.sh                 # Unix startup script
├── run.bat               # Windows startup script
└── README.md             # This file
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the Apache 2.0 License - see the original files for details.

## Support

For issues and questions:
1. Check the README files in backend/ and frontend/ directories
2. Open an issue on GitHub
3. Review the API documentation above
