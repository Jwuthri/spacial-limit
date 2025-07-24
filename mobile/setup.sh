#!/bin/bash

echo "🚀 Spatial Understanding Mobile App - Complete Setup"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if we're in the right directory
if [[ ! -f "../backend/main.py" ]]; then
    print_error "Please run this script from the mobile directory in your spatial-understanding project"
    exit 1
fi

echo ""
print_info "This script will set up BOTH versions of the mobile app:"
print_info "1. Full React Native (for production builds)"
print_info "2. Expo version (for instant testing)"
echo ""

# Ask user preference
read -p "Setup both versions? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_info "Setup cancelled"
    exit 0
fi

echo ""
print_info "🔧 Starting setup process..."

# Step 1: Check prerequisites
echo ""
print_info "📋 Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 16+ from https://nodejs.org"
    exit 1
else
    print_status "Node.js found: $(node --version)"
fi

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
else
    print_status "npm found: $(npm --version)"
fi

# Step 2: Clean up any existing projects
echo ""
print_info "🧹 Cleaning up previous installations..."

if [[ -d "SpatialUnderstandingMobile" ]]; then
    rm -rf SpatialUnderstandingMobile
    print_status "Removed old React Native project"
fi

if [[ -d "SpatialUnderstandingExpo" ]]; then
    rm -rf SpatialUnderstandingExpo
    print_status "Removed old Expo project"
fi

# Step 3: Create React Native project
echo ""
print_info "📱 Creating React Native project..."

if npx @react-native-community/cli@latest init SpatialUnderstandingMobile --version 0.72.6; then
    print_status "React Native project created successfully"
else
    print_error "Failed to create React Native project"
    exit 1
fi

# Step 4: Create Expo project  
echo ""
print_info "⚡ Creating Expo project for instant testing..."

if npx create-expo-app --template blank-typescript SpatialUnderstandingExpo; then
    print_status "Expo project created successfully"
else
    print_error "Failed to create Expo project"
    exit 1
fi

# Step 5: Copy source files to both projects
echo ""
print_info "📁 Setting up source files..."

# Check if we have a backup of source files
if [[ -d "../mobile_backup/src" ]]; then
    cp -r ../mobile_backup/src SpatialUnderstandingMobile/
    cp -r ../mobile_backup/src SpatialUnderstandingExpo/
    print_status "Copied source files from backup"
elif [[ -d "src" ]]; then
    cp -r src SpatialUnderstandingMobile/
    cp -r src SpatialUnderstandingExpo/
    print_status "Copied existing source files"
else
    print_error "No source files found. Please ensure you have the src/ directory"
    exit 1
fi

# Step 6: Install React Native dependencies
echo ""
print_info "📦 Installing React Native dependencies..."

cd SpatialUnderstandingMobile
if npm install @react-navigation/native @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context react-native-gesture-handler react-native-toast-message react-native-image-picker @react-native-async-storage/async-storage axios; then
    print_status "React Native dependencies installed"
else
    print_error "Failed to install React Native dependencies"
    exit 1
fi

# Step 7: Fix iOS Podfile (if on macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo ""
    print_info "🍎 Configuring iOS project..."
    
    # Update iOS deployment target
    sed -i '' 's/platform :ios, min_ios_version_supported/platform :ios, '\''14.0'\''/' ios/Podfile
    print_status "Updated iOS deployment target to 14.0"
    
    # Install CocoaPods if available
    if command -v pod &> /dev/null; then
        print_info "Installing iOS dependencies..."
        cd ios
        if pod install; then
            print_status "iOS dependencies installed successfully"
        else
            print_warning "iOS pod install failed - you can fix this later"
        fi
        cd ..
    else
        print_warning "CocoaPods not found. Install with: sudo gem install cocoapods"
    fi
else
    print_info "⏭️  Skipping iOS setup (not on macOS)"
fi

# Step 8: Setup Expo project
echo ""
print_info "⚡ Setting up Expo project..."

cd ../SpatialUnderstandingExpo
if npm install @react-navigation/native @react-navigation/bottom-tabs expo-image-picker @react-native-async-storage/async-storage axios; then
    print_status "Expo dependencies installed"
else
    print_error "Failed to install Expo dependencies"
    exit 1
fi

# Step 9: Update App.tsx files
echo ""
print_info "🔧 Configuring app entry points..."

# React Native App.tsx
cat > ../SpatialUnderstandingMobile/App.tsx << 'EOF'
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import Toast from 'react-native-toast-message';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import { RootStackParamList } from './src/types';
import { COLORS } from './src/constants';

const Tab = createBottomTabNavigator<RootStackParamList>();

const App: React.FC = () => {
  return (
    <SafeAreaProvider>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            tabBarActiveTintColor: COLORS.primary,
            tabBarInactiveTintColor: COLORS.textSecondary,
            tabBarStyle: {
              backgroundColor: COLORS.surface,
              borderTopColor: COLORS.border,
            },
            headerStyle: {
              backgroundColor: COLORS.primary,
            },
            headerTintColor: COLORS.surface,
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Tab.Screen
            name="Home"
            component={HomeScreen}
            options={{
              title: 'Spatial Analysis',
              tabBarLabel: 'Home',
            }}
          />
          <Tab.Screen
            name="History"
            component={HistoryScreen}
            options={{
              title: 'Analysis History',
              tabBarLabel: 'History',
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
      <Toast />
    </SafeAreaProvider>
  );
};

export default App;
EOF

# Expo App.tsx  
cat > App.tsx << 'EOF'
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import { RootStackParamList } from './src/types';
import { COLORS } from './src/constants';

const Tab = createBottomTabNavigator<RootStackParamList>();

export default function App() {
  return (
    <>
      <StatusBar style="light" backgroundColor={COLORS.primary} />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            tabBarActiveTintColor: COLORS.primary,
            tabBarInactiveTintColor: COLORS.textSecondary,
            tabBarStyle: {
              backgroundColor: COLORS.surface,
              borderTopColor: COLORS.border,
            },
            headerStyle: {
              backgroundColor: COLORS.primary,
            },
            headerTintColor: COLORS.surface,
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Tab.Screen
            name="Home"
            component={HomeScreen}
            options={{
              title: 'Spatial Analysis',
              tabBarLabel: 'Home',
            }}
          />
          <Tab.Screen
            name="History" 
            component={HistoryScreen}
            options={{
              title: 'Analysis History',
              tabBarLabel: 'History',
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
}
EOF

print_status "App entry points configured"

# Step 10: Create configuration helper
echo ""
print_info "⚙️  Creating configuration helper..."

cd ..
cat > configure_backend.sh << 'EOF'
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
EOF

chmod +x configure_backend.sh
print_status "Configuration helper created"

# Step 11: Create quick start scripts
echo ""
print_info "🚀 Creating quick start scripts..."

cat > start_expo.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting Expo development server..."
echo "Scan the QR code with Expo Go app on your phone"
cd SpatialUnderstandingExpo
npx expo start
EOF

cat > start_android.sh << 'EOF'
#!/bin/bash
echo "🤖 Starting Android development..."
echo "Make sure you have Android Studio and an emulator running"
cd SpatialUnderstandingMobile  
npm run android
EOF

cat > start_ios.sh << 'EOF'
#!/bin/bash
echo "🍎 Starting iOS development..."
echo "Make sure you have Xcode and iOS Simulator"
cd SpatialUnderstandingMobile
npm run ios
EOF

chmod +x start_expo.sh start_android.sh start_ios.sh
print_status "Quick start scripts created"

# Final summary
echo ""
echo "🎉 SETUP COMPLETE!"
echo "=================="
echo ""
print_status "Two mobile apps ready:"
print_info "  📱 React Native: SpatialUnderstandingMobile/ (production builds)"
print_info "  ⚡ Expo: SpatialUnderstandingExpo/ (instant testing)"
echo ""
print_status "Helper scripts created:"
print_info "  🔧 ./configure_backend.sh - Set backend URL"
print_info "  ⚡ ./start_expo.sh - Quick Expo testing"
print_info "  🤖 ./start_android.sh - Android development"
print_info "  🍎 ./start_ios.sh - iOS development"
echo ""
print_info "RECOMMENDED NEXT STEPS:"
print_info "1. Start your backend: cd ../backend && python main.py"
print_info "2. Configure backend URL: ./configure_backend.sh"
print_info "3. Test instantly: ./start_expo.sh"
echo ""
print_info "For Expo Go app download:"
print_info "📱 iOS: https://apps.apple.com/app/expo-go/id982107779"
print_info "📱 Android: https://play.google.com/store/apps/details?id=host.exp.exponent"
echo ""
print_status "Happy coding! 🚀" 