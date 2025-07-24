#!/bin/bash

echo "🔧 Backend URL Configuration Helper"
echo "=================================="

echo ""
echo "Choose your setup:"
echo "1. Local development (same machine)"
echo "2. Physical device (same WiFi network)" 
echo "3. Remote access (ngrok/tunnel)"
echo ""

read -p "Enter choice (1-3): " choice

case $choice in
    1)
        echo "Setting up for local development..."
        BACKEND_URL="http://localhost:8000"
        echo "Use this for iOS Simulator or Android Emulator"
        ;;
    2)
        echo ""
        echo "For physical devices, you need your computer's IP address."
        echo "Find it with: ifconfig | grep 'inet ' | grep -v 127.0.0.1"
        echo ""
        read -p "Enter your computer's IP (e.g., 192.168.1.100): " IP
        BACKEND_URL="http://${IP}:8000"
        echo "Make sure your backend is running with --host 0.0.0.0"
        ;;
    3)
        echo ""
        echo "Using ngrok for remote access..."
        echo "1. Install ngrok: https://ngrok.com"
        echo "2. Run: ngrok http 8000"
        echo "3. Copy the https URL"
        echo ""
        read -p "Enter your ngrok URL (e.g., https://abc123.ngrok.io): " NGROK_URL
        BACKEND_URL="${NGROK_URL}"
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "Updating backend URL to: $BACKEND_URL"

# Update React Native version
sed -i '' "s|BASE_URL: '[^']*'|BASE_URL: '$BACKEND_URL'|" SpatialUnderstandingMobile/src/constants/index.ts

# Update Expo version  
sed -i '' "s|BASE_URL: '[^']*'|BASE_URL: '$BACKEND_URL'|" SpatialUnderstandingExpo/src/constants/index.ts

echo "✅ Backend URL updated in both projects!"
echo ""
echo "Next steps:"
echo "1. Make sure your backend is running"
echo "2. Test with Expo: cd SpatialUnderstandingExpo && npx expo start"
echo "3. Or React Native: cd SpatialUnderstandingMobile && npm run android/ios"
