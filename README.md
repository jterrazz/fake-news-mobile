# Fake News 📱

A React Native mobile application about fake news, built with Expo.

## 🛠 Tech Stack

- **Framework:** React Native with Expo (v52)
- **State Management:** Zustand
- **Data Management:** TanStack Query
- **Navigation:** React Navigation with Bottom Tabs
- **UI Components:**
  - Expo Blur
  - Expo Haptics
  - Expo Linear Gradient
  - React Native Reanimated
- **Storage:** AsyncStorage
- **Internationalization:** i18next with expo-localization
- **Development:**
  - TypeScript
  - Custom TypeScript configurations (@jterrazz packages)
  - Jest for testing

## 📁 Project Structure

```
src/
├── application/     # Application layer
├── core/           # Core functionality
├── domain/         # Business logic
├── infrastructure/ # External services
└── presentation/   # UI components
```

## 📱 Platform Support

- iOS (including tablet support)
- Android

## 🚀 Getting Started

1. **Setup Environment**
   ```bash
   git clone https://github.com/yourusername/fake-news-mobile.git
   cd fake-news-mobile
   npm install
   ```

2. **Development**
   ```bash
   # Start development server
   npm run dev

   # Platform specific development
   npm run dev:ios     # iOS
   npm run dev:android # Android
   ```

3. **Production Build**
   ```bash
   # iOS
   npm run ios

   # Android
   npm run android
   ```

## 🧹 Maintenance

Clean the project:
```bash
npm run clean  # Removes ios, android, node_modules, and .expo directories
```

## ⚙️ Configuration Files

- `app.json` - Expo configuration
- `metro.config.cjs` - Metro bundler configuration
- `babel.config.cjs` - Babel configuration
- `tsconfig.json` - TypeScript configuration

## 🌐 Available Languages

Play the game in multiple languages! Powered by i18next and expo-localization.

## 📄 License

This project is private and all rights are reserved.

## 🎪 Support & Community

- Report bugs or suggest features through GitHub issues
- Join our gaming community (coming soon!)
- Contact the game developers for support

---

Built with React Native and Expo 