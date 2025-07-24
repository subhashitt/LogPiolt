# 🔒 Secure Log Analysis Tool

A React-based web application for secure log analysis that protects user privacy by masking sensitive data locally before AI processing.

## 🌟 Features

### Core Functionality
- **📁 File Upload & Text Input**: Support for both file uploads (.log, .txt) and direct text input
- **🎯 Smart Filtering**: Multi-dimensional filtering by timestamp, log level, keywords, components, and response codes
- **🔐 Local Data Masking**: Client-side masking of sensitive information (passwords, tokens, IPs, API keys)
- **🤖 AI-Powered Analysis**: Intelligent log analysis with insights, recommendations, and critical issue detection
- **📊 Visual Results**: Comprehensive analysis results with statistics, trends, and actionable recommendations

### Security & Privacy
- **🛡️ Privacy-First Design**: All sensitive data is masked locally before any external API calls
- **🔒 No Data Leakage**: Raw logs never leave your browser environment
- **⏰ Session Management**: Logs expire after processing to ensure data protection

### User Experience
- **🎨 Modern UI**: Built with Tailwind CSS for a responsive, accessible interface
- **📱 Responsive Design**: Works seamlessly across desktop, tablet, and mobile devices
- **♿ Accessibility**: Keyboard navigation and screen reader support
- **⚡ Fast Performance**: Optimized with Vite for quick loading and smooth interactions

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone or download the project**
   ```bash
   git clone <repository-url>
   cd secure-log-analysis-ui
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   - Navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
npm run preview
```

## 🎯 Usage Guide

### 1. Upload Logs
- **File Upload**: Drag and drop log files or click to browse
- **Text Input**: Paste log data directly into the text area
- Supported formats: .log, .txt, and other text-based files

### 2. Apply Filters
- **Timestamp Range**: Filter logs within specific time windows
- **Log Level**: Filter by ERROR, WARN, INFO, DEBUG
- **Keyword Search**: Search for specific terms in log messages
- **Component Filter**: Filter by service/module names
- **Response Code**: Filter by HTTP status codes or categories

### 3. Mask Sensitive Data
- Click "🔒 Mask Logs" to automatically mask:
  - Passwords and authentication tokens
  - API keys and secrets
  - IP addresses and internal URLs
  - Authorization headers
- Preview masked logs before analysis

### 4. AI Analysis
- Click "🤔 Submit to AI" to analyze masked logs
- Get comprehensive results including:
  - **Overview**: Log statistics and summary
  - **Insights**: Key patterns and discoveries
  - **Recommendations**: Actionable improvement suggestions
  - **Critical Issues**: Urgent problems requiring attention

### 5. Export Results
- Download analysis reports as JSON
- Save filtered log data for further analysis

## 🏗️ Project Structure

```
src/
├── components/           # React components
│   ├── LogUploadSection.tsx    # File upload and text input
│   ├── FilterControls.tsx      # Filtering interface
│   ├── LogPreview.tsx          # Log display and pagination
│   └── AnalysisResults.tsx     # AI analysis results
├── types.ts             # TypeScript type definitions
├── App.tsx              # Main application component
├── main.tsx             # Application entry point
└── index.css            # Global styles and Tailwind imports
```

## 🔧 Technology Stack

### Frontend Framework
- **React 18**: Modern React with hooks and functional components
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and development server

### Styling & UI
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Modern icon library
- **Responsive Design**: Mobile-first approach

### Data Processing
- **React Table**: Advanced table functionality
- **Lodash**: Utility functions for data manipulation
- **Fuse.js**: Fuzzy search capabilities

## 🛡️ Security Features

### Local Data Masking
The application implements comprehensive client-side data masking:

```typescript
// Example masking patterns
const maskSensitiveData = (message: string): string => {
  return message
    .replace(/password[=:]\s*[^\s&]+/gi, 'password=***MASKED***')
    .replace(/token[=:]\s*[^\s&]+/gi, 'token=***MASKED***')
    .replace(/api[_-]?key[=:]\s*[^\s&]+/gi, 'api_key=***MASKED***')
    .replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '***IP_MASKED***')
    .replace(/Bearer\s+[^\s]+/gi, 'Bearer ***MASKED***');
};
```

### Privacy Protection
- No raw log data is ever sent to external services
- All masking happens in the browser
- Temporary data handling with automatic cleanup
- No persistent storage of sensitive information

## 🧪 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Code Quality
- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting
- Component-based architecture

### Testing
```bash
npm run test         # Run tests (when available)
```

## 🎨 Customization

### Theming
Customize colors and styling in `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: { /* custom primary colors */ },
      success: { /* custom success colors */ },
      // ... more customizations
    }
  }
}
```

### Masking Rules
Add custom masking patterns in the App component:

```typescript
const customMaskingRule = (text: string): string => {
  return text.replace(/your-custom-pattern/gi, '***MASKED***');
};
```

## 📈 Future Enhancements

- [ ] Custom masking rule editor
- [ ] Save and reuse filter presets
- [ ] Enhanced export formats (PDF, CSV)
- [ ] Real-time log streaming
- [ ] Advanced analytics dashboard
- [ ] Integration with popular log aggregators

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Links

- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)

## 📞 Support

For questions, issues, or feature requests, please open an issue in the GitHub repository.
