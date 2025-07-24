# Spatial Understanding Mobile App

React Native mobile application for iOS and Android that provides AI-powered spatial understanding and computer vision analysis using the existing backend API.

## Features

### Core Functionality
- **Image Upload**: Camera or gallery image selection
- **Detection Types**: 2D/3D bounding boxes, segmentation masks, key points
- **Real-time Analysis**: AI-powered spatial understanding via Gemini API
- **History Management**: View, browse, and delete previous analysis results
- **Multi-language Support**: Segmentation labels in multiple languages
- **Offline Capabilities**: Local image processing and caching

### Mobile-Specific Features
- **Native Image Picker**: Camera and photo library integration
- **Touch-friendly UI**: Optimized for mobile interaction
- **Cross-platform**: iOS and Android support
- **Responsive Design**: Adapts to different screen sizes
- **Native Navigation**: Tab-based navigation with React Navigation

## Prerequisites

- **Node.js** 16+ 
- **React Native CLI** or **Expo CLI**
- **Backend API** running (see main project README)

### iOS Development
- **Xcode** 12+
- **iOS Simulator** or physical iOS device
- **CocoaPods** for iOS dependencies

### Android Development  
- **Android Studio**
- **Android SDK** (API level 21+)
- **Android Emulator** or physical Android device

## Installation

### 1. Install Dependencies
```bash
cd mobile
npm install
```

### 2. iOS Setup (macOS only)
```bash
cd ios
pod install
cd ..
```

### 3. Configure Backend URL
Edit `src/constants/index.ts` and update the `BASE_URL`:
```typescript
export const API_CONFIG = {
  BASE_URL: 'http://YOUR_BACKEND_IP:8000', // Replace with your backend URL
  // For Android emulator: http://10.0.2.2:8000
  // For iOS simulator: http://localhost:8000  
  // For physical device: http://YOUR_COMPUTER_IP:8000
};
```

### 4. Run the Application

#### iOS
```bash
npm run ios
# or
npx react-native run-ios
```

#### Android
```bash
npm run android
# or  
npx react-native run-android
```

## Project Structure

```
mobile/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── DetectionTypeSelector.tsx
│   │   ├── PromptPanel.tsx
│   │   └── AnalysisResults.tsx
│   ├── screens/             # Main app screens
│   │   ├── HomeScreen.tsx   # Image upload & analysis
│   │   └── HistoryScreen.tsx # Analysis history
│   ├── services/            # API and external services
│   │   └── api.ts          # Backend API integration
│   ├── types/              # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/              # Utility functions
│   │   └── image.ts        # Image processing helpers
│   └── constants/          # App constants and configuration
│       └── index.ts
├── App.tsx                 # Main app component
├── package.json           # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── README.md            # This file
```

## Key Components

### HomeScreen
- Image upload via camera or gallery
- Detection type selection (2D/3D boxes, segmentation, points)
- Configuration panel (prompts, language, temperature)
- Real-time analysis with loading states
- Results visualization

### HistoryScreen
- Browse previous analysis results
- View prediction details
- Delete unwanted predictions
- Pull-to-refresh functionality

### API Service
- Axios-based HTTP client
- Form data handling for image uploads
- Error handling and retries
- Response caching

## Configuration

### Backend Connection
The app connects to your existing backend API. Update the `BASE_URL` in `src/constants/index.ts`:

- **Local Development**: `http://localhost:8000`
- **Android Emulator**: `http://10.0.2.2:8000`
- **Physical Device**: `http://YOUR_COMPUTER_IP:8000`

### Detection Settings
Default values can be modified in `src/constants/index.ts`:

```typescript
export const DEFAULTS = {
  TEMPERATURE: 0.4,
  TARGET_PROMPT: 'items',
  SEGMENTATION_LANGUAGE: 'English',
  DETECTION_TYPE: '2D bounding boxes',
};
```

## Development

### Running in Development Mode
```bash
# Start Metro bundler
npm start

# Run on iOS (in another terminal)
npm run ios

# Run on Android (in another terminal) 
npm run android
```

### Debugging
- **React Native Debugger**: For comprehensive debugging
- **Flipper**: For network inspection and performance monitoring
- **Console Logs**: Available in Metro bundler terminal

### Building for Production

#### iOS
```bash
npm run build:ios
```

#### Android
```bash
npm run build:android
```

## Troubleshooting

### Common Issues

#### Metro bundler issues
```bash
npm start -- --reset-cache
```

#### iOS build issues
```bash
cd ios && pod install && cd ..
npm run ios:clean
npm run ios
```

#### Android build issues
```bash
npm run android:clean
npm run android
```

#### Network connectivity
- Ensure backend is running and accessible
- Check firewall settings
- Verify IP addresses for physical devices
- Use `adb port forwarding` for Android development

#### Image picker permissions
The app automatically requests camera and photo library permissions. Make sure to:
- Accept permissions when prompted
- Check device settings if permissions were denied
- Add permission descriptions in native configuration files

## API Integration

The mobile app uses the same API endpoints as the web frontend:

- `POST /analyze` - Analyze uploaded images
- `GET /history` - Retrieve analysis history  
- `GET /prediction/{id}` - Get specific prediction
- `DELETE /prediction/{id}` - Delete prediction

## Performance Optimizations

### Image Processing
- Automatic image resizing before upload
- Base64 encoding optimization
- Memory management for large images

### Network
- Request/response caching
- Retry logic for failed requests
- Background task handling

### UI/UX
- Loading states and progress indicators
- Error boundaries and graceful degradation
- Smooth animations and transitions

## Contributing

1. Follow existing code structure and patterns
2. Use TypeScript for type safety
3. Add proper error handling
4. Test on both iOS and Android
5. Update documentation for new features

## License

This project follows the same license as the main spatial-understanding project. 