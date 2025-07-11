# AI Medicine Safety Checker

A comprehensive AI-powered web application that analyzes medications for specific safety concerns related to women, children, and pregnant women using Perplexity AI as the primary service with Google Gemini as fallback.


## 🚀 Features

### Core Analysis Features
- **Specialized Safety Analysis**: Focus on women's health, pediatric safety, and pregnancy considerations
- **AI-Powered Insights**: Utilizes Perplexity AI (primary) with Google Gemini fallback for comprehensive analysis
- **Drug Interaction Checker**: Multi-drug interaction analysis with severity ratings
- **Clinical Trial Information**: Reports on drug testing in specific populations
- **Alternative Medications**: Smart recommendations for safer alternatives

### Phase 3 Enhanced UI/UX Features ✨
- **Professional Medical Design**: Medical-grade color scheme and typography
- **Complete Accessibility**: WCAG 2.1 AA compliant with screen reader support
- **Responsive Design**: Mobile-first design optimized for all devices
- **Advanced Form Validation**: Real-time validation with smart error messages
- **Export Functionality**: Professional PDF, HTML, and text report generation
- **Progressive Web App**: Native app-like experience with offline capability
- **Smart Autocomplete**: Medicine name suggestions with keyboard navigation
- **Enhanced Loading States**: Medical-themed loading animations and progress indicators

### Accessibility Features
- **Keyboard Navigation**: Complete keyboard accessibility with focus management
- **Screen Reader Support**: Comprehensive ARIA labels and announcements
- **High Contrast Mode**: Automatic adaptation for accessibility preferences
- **Reduced Motion Support**: Respects user motion preferences
- **Color-Blind Friendly**: Tested for all types of color vision deficiencies

## 🛠️ Technology Stack

### Frontend
- React 18 with Vite
- Modern CSS3 with CSS custom properties
- Enhanced accessibility features
- Progressive Web App (PWA) capabilities
- Responsive design with mobile optimization
- Advanced form validation system

### Backend
- Node.js with Express.js
- Perplexity AI integration (primary service, 25s timeout)
- Google Gemini 2.5 Flash API integration (fallback service)
- Rate limiting and security middleware
- Comprehensive error handling

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ installed
- Perplexity API key ([Get one here](https://perplexity.ai/pro))
- Google Gemini API key ([Get one here](https://ai.google.dev/)) - For fallback
- Git for version control

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the backend directory:
   ```env
   PORT=3001
   PERPLEXITY_API_KEY=your_perplexity_api_key_here
   GEMINI_API_KEY=your_gemini_api_key_here
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:5173
   RATE_LIMIT_WINDOW=15
   RATE_LIMIT_MAX=100
   API_TIMEOUT_MS=30000
   ```

   **Note**: Perplexity is used as the primary AI service with a 25-second timeout, then falls back to Google Gemini if needed.

4. **Start the backend server**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## 🔧 Development

### Backend Development
- The backend server runs on `http://localhost:3001`
- Use `npm run dev` for development with auto-reload
- API endpoints are available at `/api/health` and `/api/medicine`

### Frontend Development
- The frontend development server runs on `http://localhost:5173`
- Hot reload is enabled for instant updates
- The frontend automatically connects to the backend API

### Environment Variables

#### Backend (.env)
```env
PORT=3001                                    # Server port
PERPLEXITY_API_KEY=your_perplexity_api_key_here  # Perplexity API key (primary)
GEMINI_API_KEY=your_gemini_api_key_here     # Google Gemini API key (fallback)
NODE_ENV=development                         # Environment (development/production)
CORS_ORIGIN=http://localhost:5173           # Frontend URL for CORS
RATE_LIMIT_WINDOW=15                        # Rate limit window in minutes
RATE_LIMIT_MAX=100                          # Max requests per window
API_TIMEOUT_MS=30000                        # API timeout in milliseconds
```

#### Frontend (Optional)
Create a `.env` file in the frontend directory:
```env
VITE_API_URL=http://localhost:3001          # Backend API URL
VITE_APP_NAME=AI Medicine Safety Checker    # App name
```

## 📋 API Endpoints

### Health Check
- **GET** `/api/health` - Basic health check
- **GET** `/api/health/detailed` - Detailed system information

### Medicine Analysis
- **POST** `/api/medicine/analyze` - Main analysis endpoint
  ```json
  {
    "medicineName": "Ibuprofen",
    "patientInfo": {
      "age": 25,
      "gender": "female",
      "isPregnant": false,
      "isChild": false
    }
  }
  ```

- **GET** `/api/medicine/alternatives` - Get alternative medications
  ```
  GET /api/medicine/alternatives?medicine=Ibuprofen&condition=headache
  ```

- **POST** `/api/medicine/interactions` - Check drug interactions
  ```json
  {
    "medicines": ["Ibuprofen", "Warfarin", "Aspirin"]
  }
  ```

## 🚀 Deployment

### Frontend Deployment (Vercel)

1. **Connect your repository to Vercel**
2. **Set build settings:**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Set environment variables:**
   ```
   VITE_API_URL=https://your-backend-url.render.com
   ```

### Backend Deployment (Render)

1. **Connect your repository to Render**
2. **Set build settings:**
   - Build Command: `npm install`
   - Start Command: `npm start`

3. **Set environment variables:**
   ```
   PORT=3001
   GEMINI_API_KEY=your_actual_gemini_api_key
   NODE_ENV=production
   CORS_ORIGIN=https://your-frontend-url.vercel.app
   RATE_LIMIT_WINDOW=15
   RATE_LIMIT_MAX=100
   ```

## 🔒 Security Features

- **Rate Limiting**: Prevents API abuse
- **CORS Protection**: Restricts cross-origin requests
- **Input Validation**: Validates all user inputs
- **Helmet Security**: Adds security headers
- **Environment Variables**: Keeps sensitive data secure

## ⚠️ Important Medical Disclaimers

This application is for **informational purposes only** and should not replace professional medical advice. Key points:

- Always consult healthcare providers for medical decisions
- Do not use for emergency medical situations
- Medication effects vary between individuals
- For emergencies: Call 911 (US) or your local emergency number
- Poison Control: 1-800-222-1222 (US)

## 🐛 Troubleshooting

### Common Issues

1. **Backend not starting:**
   - Check if Node.js 18+ is installed
   - Verify Gemini API key is set correctly
   - Ensure port 3001 is not in use

2. **Frontend can't connect to backend:**
   - Verify backend is running on correct port
   - Check CORS configuration
   - Ensure API URL is correct in frontend

3. **Gemini API errors:**
   - Verify API key is valid and active
   - Check API quotas and rate limits
   - Ensure internet connection is stable

### Error Codes
- **400**: Invalid request format
- **429**: Rate limit exceeded
- **500**: Server error (check logs)
- **503**: Gemini API unavailable

## 📚 Project Structure

```
ai-medicine-safety/
├── backend/                 # Node.js backend
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   ├── utils/              # Utility functions
│   └── server.js           # Main server file
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── styles/         # CSS styles
│   └── public/             # Static assets
└── README.md               # This file
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add appropriate tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License. See LICENSE file for details.

## 🙏 Acknowledgments

- Google Gemini AI for providing the AI analysis capabilities
- Medical databases and resources for safety information
- Open source community for the excellent libraries used

---

**Remember**: This tool provides educational information only. Always consult healthcare professionals for medical advice.

## ✨ Phase 2 Features (Advanced Analysis)

### Advanced Safety Analysis
- **Gender-specific recommendations**: Specialized analysis for women's health concerns
- **Pediatric considerations**: Age-appropriate dosing and safety information for children
- **Pregnancy safety**: Comprehensive analysis for pregnant and breastfeeding women
- **Clinical trial data**: Integration of relevant clinical trial information
- **Alternative medications**: Smart recommendations for safer alternatives

### Drug Interaction Checker
- **Multi-drug analysis**: Check interactions between 2-10 medications simultaneously
- **Severity classification**: Interactions categorized as High, Moderate, or Low risk
- **Detailed explanations**: Clear descriptions of interaction mechanisms
- **Clinical recommendations**: Actionable guidance for healthcare decisions

### Enhanced UI/UX
- **Tabbed interface**: Easy navigation between analysis and interaction checking
- **Advanced reporting**: Comprehensive safety reports with visual indicators
- **Risk visualization**: Color-coded badges and severity indicators
- **Mobile responsive**: Optimized for all device sizes
