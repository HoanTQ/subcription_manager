# 🔧 Technical Details - Subscription Manager

Tài liệu kỹ thuật chi tiết về công nghệ và kiến trúc hệ thống.

## 🏗️ Kiến trúc tổng quan

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Frontend  │    │  Mobile App     │    │   Backend API   │
│   (React)       │◄──►│ (React Native)  │◄──►│   (Node.js)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
                                               ┌─────────────────┐
                                               │ Google Sheets   │
                                               │   (Database)    │
                                               └─────────────────┘
```

## 🌐 Web Frontend

### Core Technologies
- **Framework:** React 18.2.0
- **Build Tool:** Vite 5.0.0
- **Language:** JavaScript (ES6+)
- **Styling:** Tailwind CSS 3.3.0
- **HTTP Client:** Axios 1.6.0
- **Icons:** Lucide React 0.294.0

### Key Libraries
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.8.0",
  "axios": "^1.6.0",
  "tailwindcss": "^3.3.0",
  "lucide-react": "^0.294.0"
}
```

### Architecture Patterns
- **Component-based:** Functional components với React Hooks
- **State Management:** useState, useEffect, custom hooks
- **Routing:** React Router DOM với protected routes
- **Authentication:** JWT token trong localStorage
- **API Layer:** Centralized axios instance với interceptors

### Custom Hooks
- `useToast()` - Toast notification management
- `useAuth()` - Authentication state management
- `useApi()` - API calls với error handling

### Component Structure
```
src/
├── components/
│   ├── Layout.jsx          # Main layout wrapper
│   ├── Toast.jsx           # Toast notification component
│   └── ProtectedRoute.jsx  # Route protection
├── pages/
│   ├── Login.jsx           # Authentication
│   ├── Dashboard.jsx       # Overview dashboard
│   ├── Accounts.jsx        # Account management
│   ├── Subscriptions.jsx   # Subscription management
│   └── Upcoming.jsx        # Upcoming payments
├── hooks/
│   ├── useToast.js         # Toast management
│   └── useAuth.js          # Authentication
└── utils/
    ├── api.js              # API configuration
    └── auth.js             # Auth utilities
```

### Build & Development
- **Dev Server:** Vite dev server (localhost:5173)
- **Hot Reload:** Fast refresh với Vite HMR
- **Build:** `npm run build` → dist/ folder
- **Preview:** `npm run preview` cho production build

## 🚀 Backend API

### Core Technologies
- **Runtime:** Node.js 18+
- **Framework:** Express.js 4.18.0
- **Language:** JavaScript (CommonJS)
- **Authentication:** JWT (jsonwebtoken 9.0.0)
- **Encryption:** Node.js crypto module
- **Database Client:** Google Spreadsheet API

### Key Dependencies
```json
{
  "express": "^4.18.0",
  "jsonwebtoken": "^9.0.0",
  "bcryptjs": "^2.4.3",
  "cors": "^2.8.5",
  "dotenv": "^16.0.0",
  "google-spreadsheet": "^4.1.0",
  "google-auth-library": "^9.0.0"
}
```

### API Architecture
- **RESTful API:** Standard HTTP methods (GET, POST, PUT, DELETE)
- **Middleware Stack:** CORS, JSON parser, authentication
- **Error Handling:** Centralized error middleware
- **Validation:** Input validation và sanitization
- **Security:** JWT tokens, password hashing, CORS protection

### API Endpoints
```
Authentication:
POST /api/v1/auth/register    # User registration
POST /api/v1/auth/login       # User login
POST /api/v1/auth/refresh     # Token refresh

Accounts:
GET    /api/v1/accounts       # List accounts
POST   /api/v1/accounts       # Create account
GET    /api/v1/accounts/:id   # Get account
PUT    /api/v1/accounts/:id   # Update account
DELETE /api/v1/accounts/:id   # Delete account

Subscriptions:
GET    /api/v1/subscriptions           # List subscriptions
POST   /api/v1/subscriptions           # Create subscription
GET    /api/v1/subscriptions/:id       # Get subscription
PUT    /api/v1/subscriptions/:id       # Update subscription
DELETE /api/v1/subscriptions/:id       # Delete subscription
POST   /api/v1/subscriptions/:id/pause # Pause subscription
POST   /api/v1/subscriptions/:id/resume# Resume subscription
POST   /api/v1/subscriptions/:id/cancel# Cancel subscription

Dashboard:
GET /api/v1/dashboard/stats    # Dashboard statistics
GET /api/v1/dashboard/upcoming # Upcoming payments
```

### Database Layer
- **Abstraction:** Database class với methods: connect(), addRow(), getRows(), updateRow(), deleteRow()
- **Fallback:** Mock database khi Google Sheets không available
- **Connection Pooling:** Single connection instance với reconnection logic

### Security Features
- **Password Encryption:** bcryptjs với salt rounds
- **JWT Security:** Access tokens (15m) + Refresh tokens (7d)
- **CORS:** Configured cho frontend domains
- **Input Validation:** Sanitization và type checking
- **Rate Limiting:** Basic protection (có thể mở rộng)

## 🗄️ Database (Google Sheets)

### Configuration
- **Service:** Google Sheets API v4
- **Authentication:** Service Account với private key
- **Sheets ID:** `1jsOOqz6OH-d0Vpaqz8NgGZ0k_sXJ-QejZBS9-dMFkQ8`
- **Service Account:** `subscription-manager@gen-lang-client-0012236274.iam.gserviceaccount.com`

### Schema Design
```
Users Sheet:
- user_id (UUID)
- email (string, unique)
- password_hash (bcrypt)
- status (ACTIVE/INACTIVE)
- created_at (ISO timestamp)
- updated_at (ISO timestamp)

Accounts Sheet:
- account_id (UUID)
- user_id (foreign key)
- service_name (string)
- login_id (string)
- password_ciphertext (encrypted)
- password_iv (encryption vector)
- password_tag (encryption tag)
- url (string)
- category_id (UUID)
- tags (comma-separated)
- notes (text)
- is_deleted (boolean)
- created_at (ISO timestamp)
- updated_at (ISO timestamp)

Subscriptions Sheet:
- subscription_id (UUID)
- user_id (foreign key)
- account_id (foreign key, optional)
- service_name (string)
- plan_name (string)
- subscription_type (RECURRING/FIXED_TERM)
- cycle (DAILY/MONTHLY/YEARLY/CUSTOM_DAYS)
- cycle_days (number, for CUSTOM_DAYS)
- amount_per_cycle (decimal)
- currency (string, default VND)
- start_date (date)
- end_date (date, for FIXED_TERM)
- next_due_date (date)
- reminder_days (number)
- status (ACTIVE/PAUSED/CANCELLED)
- notes (text)
- is_deleted (boolean)
- created_at (ISO timestamp)
- updated_at (ISO timestamp)

Categories Sheet:
- category_id (UUID)
- user_id (foreign key)
- name (string)
- created_at (ISO timestamp)
```

### Data Operations
- **Read:** Batch reading với filtering
- **Write:** Individual row operations
- **Update:** In-place updates với optimistic locking
- **Delete:** Soft delete với is_deleted flag
- **Indexing:** Client-side filtering và sorting

### Backup & Recovery
- **Google Drive:** Automatic backup qua Google Drive
- **Version History:** Google Sheets built-in versioning
- **Export:** CSV/Excel export capabilities

## 📱 Mobile App (React Native + Expo)

### Core Technologies
- **Framework:** React Native 0.72.0
- **Platform:** Expo SDK 49.0.0
- **Language:** JavaScript (ES6+)
- **Navigation:** React Navigation 6.0
- **HTTP Client:** Axios 1.6.0
- **Storage:** AsyncStorage
- **Icons:** Expo Vector Icons

### Key Dependencies
```json
{
  "expo": "~49.0.0",
  "react": "18.2.0",
  "react-native": "0.72.6",
  "@react-navigation/native": "^6.0.0",
  "@react-navigation/bottom-tabs": "^6.0.0",
  "@react-navigation/stack": "^6.0.0",
  "axios": "^1.6.0",
  "@react-native-async-storage/async-storage": "1.18.2",
  "expo-vector-icons": "^13.0.0"
}
```

### App Architecture
- **Navigation:** Tab Navigator + Stack Navigator
- **State Management:** React Context + useReducer
- **Authentication:** JWT tokens trong AsyncStorage
- **API Integration:** Shared axios instance với web app
- **Offline Support:** AsyncStorage caching

### Screen Structure
```
src/
├── screens/
│   ├── auth/
│   │   ├── LoginScreen.js      # Authentication
│   │   └── RegisterScreen.js   # User registration
│   ├── dashboard/
│   │   └── DashboardScreen.js  # Overview dashboard
│   ├── accounts/
│   │   ├── AccountsScreen.js   # Account list
│   │   └── AccountFormScreen.js# Add/Edit account
│   ├── subscriptions/
│   │   ├── SubscriptionsScreen.js # Subscription list
│   │   └── SubscriptionFormScreen.js # Add/Edit subscription
│   └── upcoming/
│       └── UpcomingScreen.js   # Upcoming payments
├── components/
│   ├── common/
│   │   ├── LoadingSpinner.js   # Loading indicator
│   │   ├── ErrorMessage.js     # Error display
│   │   └── EmptyState.js       # Empty state
│   └── forms/
│       ├── InputField.js       # Form input
│       └── DatePicker.js       # Date selection
├── contexts/
│   ├── AuthContext.js          # Authentication state
│   └── DataContext.js          # App data state
├── navigation/
│   ├── AppNavigator.js         # Main navigation
│   ├── AuthNavigator.js        # Auth flow
│   └── TabNavigator.js         # Bottom tabs
├── config/
│   ├── api.js                  # API configuration
│   └── theme.js                # App theme
└── utils/
    ├── storage.js              # AsyncStorage utilities
    ├── validation.js           # Form validation
    └── formatters.js           # Data formatters
```

### Platform Features
- **iOS:** Native look & feel với iOS design patterns
- **Android:** Material Design components
- **Cross-platform:** Shared business logic
- **Performance:** Optimized FlatList cho large datasets
- **Gestures:** Pull-to-refresh, swipe actions

### Build & Deployment
- **Development:** Expo Go app
- **Staging:** Expo Development Build
- **Production:** Standalone APK/IPA
- **OTA Updates:** Expo Updates service
- **App Store:** Ready for iOS App Store & Google Play

## 🔐 Security Implementation

### Authentication Flow
```
1. User login → Backend validates → JWT tokens generated
2. Access token (15min) + Refresh token (7 days)
3. Frontend stores tokens → Automatic refresh
4. API requests include Bearer token
5. Backend validates token → Allow/Deny access
```

### Password Security
- **Hashing:** bcryptjs với salt rounds = 12
- **Account Passwords:** AES-256-GCM encryption
- **Key Management:** Environment variables
- **Validation:** Strong password requirements

### Data Protection
- **HTTPS:** All API communications
- **CORS:** Restricted origins
- **Input Sanitization:** XSS protection
- **SQL Injection:** N/A (Google Sheets API)
- **Rate Limiting:** Basic implementation

## 📊 Performance Considerations

### Frontend Optimization
- **Code Splitting:** Route-based splitting
- **Lazy Loading:** Component lazy loading
- **Memoization:** React.memo cho expensive components
- **Bundle Size:** Tree shaking với Vite
- **Caching:** Browser caching cho static assets

### Backend Optimization
- **Connection Pooling:** Single Google Sheets connection
- **Caching:** In-memory caching cho frequent queries
- **Pagination:** Limit/offset cho large datasets
- **Compression:** Gzip compression
- **Error Handling:** Graceful degradation

### Mobile Optimization
- **FlatList:** Virtualized lists cho performance
- **Image Optimization:** Compressed images
- **Bundle Size:** Expo optimization
- **Memory Management:** Proper cleanup
- **Network:** Request batching và caching

## 🚀 Deployment Architecture

### Development Environment
```
Web:      localhost:5173 (Vite dev server)
API:      localhost:3001 (Express server)
Mobile:   Expo Go app
Database: Google Sheets (live)
```

### Production Considerations
- **Web:** Static hosting (Vercel, Netlify)
- **API:** Node.js hosting (Railway, Heroku)
- **Mobile:** App stores (iOS/Android)
- **Database:** Google Sheets (production)
- **CDN:** Static assets delivery
- **SSL:** HTTPS certificates
- **Monitoring:** Error tracking và analytics

## 🔧 Development Tools

### Code Quality
- **Linting:** ESLint configuration
- **Formatting:** Prettier
- **Git Hooks:** Pre-commit hooks
- **Testing:** Jest (có thể mở rộng)

### Development Workflow
- **Version Control:** Git với feature branches
- **Package Manager:** npm
- **Scripts:** Automated build và deploy scripts
- **Environment:** .env files cho configuration
- **Documentation:** Inline comments và README files

---

**📝 Note:** Tài liệu này được cập nhật theo phiên bản hiện tại của hệ thống. Các thay đổi kỹ thuật sẽ được cập nhật trong các phiên bản tiếp theo.