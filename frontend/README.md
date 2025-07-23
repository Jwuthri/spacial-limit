# Spatial Understanding Frontend

Next.js frontend for the spatial understanding application with modern React components and TypeScript.

## Setup

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Environment Setup:**
   Create a `.env.local` file:
   ```bash
   BACKEND_URL=http://localhost:8000
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

### Detection Types
- **2D Bounding Boxes**: Rectangular object detection
- **3D Bounding Boxes**: 3D spatial object detection
- **Segmentation Masks**: Pixel-level object segmentation
- **Points**: Key point or landmark detection

### User Interface
- **Drag & Drop**: Easy image upload via drag and drop
- **Live Preview**: Real-time visualization of detection results
- **Interactive Controls**: Adjust detection parameters
- **Multi-language**: Support for segmentation labels in different languages
- **Temperature Control**: Fine-tune AI model behavior

### Technology Stack
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Jotai**: Atomic state management
- **CSS Variables**: Theme support with dark/light mode
- **React Resize Detector**: Responsive canvas sizing

## Components

- `page.tsx`: Main application page
- `ImageCanvas.tsx`: Image display and detection visualization
- `DetectionTypeSelector.tsx`: Radio buttons for detection type selection
- `PromptPanel.tsx`: Configuration panel for detection parameters

## State Management

The app uses Jotai for state management with the following atoms:

- `ImageSrcAtom`: Current uploaded image
- `DetectTypeAtom`: Selected detection type
- `BoundingBoxes2DAtom`: 2D detection results
- `BoundingBoxes3DAtom`: 3D detection results
- `BoundingBoxMasksAtom`: Segmentation results
- `PointsAtom`: Point detection results
- `IsLoadingAtom`: Loading state
- `TemperatureAtom`: Model temperature setting

## Build & Deploy

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Development

```bash
# Run linter
npm run lint

# Development server with hot reload
npm run dev
``` 