# FreelancePro Frontend

Modern React application built with Vite for the FreelancePro platform.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📂 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Navbar.jsx
│   ├── Footer.jsx
│   └── ProtectedRoute.jsx
├── pages/              # Page components
│   ├── LandingPage.jsx
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── DashboardPage.jsx
│   ├── BrowseJobsPage.jsx
│   ├── FreelancersPage.jsx
│   ├── MessagesPage.jsx
│   └── ...
├── services/           # API service layer
│   └── api.js
├── store/             # State management
│   ├── authStore.js
│   └── notificationStore.js
├── lib/               # Utilities
│   ├── api.js         # Axios instance
│   ├── socket.js      # Socket.io client
│   └── utils.js       # Helper functions
├── App.jsx            # Main app component
├── main.jsx           # Application entry
└── index.css          # Global styles
```

## 🎨 Styling

Built with TailwindCSS for rapid UI development.

### Custom Classes
```css
.btn              /* Base button */
.btn-primary      /* Primary button */
.btn-secondary    /* Secondary button */
.btn-outline      /* Outline button */
.input            /* Form input */
.card             /* Card container */
```

### Color Palette
```
Primary: Green (#22c55e - #14532d)
Gray Scale: Full range
```

## 🔐 Authentication

### Login Flow
```javascript
import { useAuthStore } from './store/authStore';

const { setAuth, logout } = useAuthStore();

// Login
const response = await authAPI.login(credentials);
setAuth(user, accessToken, refreshToken);

// Logout
logout();
```

### Protected Routes
```jsx
<ProtectedRoute roles={['client']}>
  <PostJobPage />
</ProtectedRoute>
```

## 📡 API Integration

### Making API Calls
```javascript
import { jobAPI } from './services/api';

// Get jobs
const jobs = await jobAPI.getJobs({ category: 'development' });

// Create job
const newJob = await jobAPI.createJob(jobData);
```

### Using React Query
```javascript
import { useQuery } from 'react-query';

const { data, isLoading } = useQuery('jobs', () => jobAPI.getJobs());
```

## 🔌 Real-time Features

### Socket.io Integration
```javascript
import { initializeSocket, onEvent } from './lib/socket';

// Initialize connection
const socket = initializeSocket(userId);

// Listen for events
onEvent('new_message', handleNewMessage);
```

## 🗂️ State Management

Using Zustand for lightweight state management.

### Auth Store
```javascript
const { user, isAuthenticated, setAuth, logout } = useAuthStore();
```

### Notification Store
```javascript
const { notifications, addNotification, markAsRead } = useNotificationStore();
```

## 🎯 Key Features

### Landing Page
- Hero section with search
- Category showcase
- Featured freelancers
- How it works section
- Trust indicators
- CTA sections

### Dashboard
- Role-based views
- Statistics cards
- Recent activity
- Quick actions

### Job Browsing
- Advanced filters
- Search functionality
- Real-time updates
- Detailed job cards

## 🛠️ Development

### Environment Variables
Create `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### Code Style
- Use functional components
- Prefer hooks over class components
- Follow ESLint rules
- Use Prettier for formatting

### Component Example
```jsx
import { useState } from 'react';

const MyComponent = () => {
  const [state, setState] = useState(initialValue);
  
  return (
    <div className="card">
      {/* Component content */}
    </div>
  );
};

export default MyComponent;
```

## 📦 Build

```bash
# Build for production
npm run build

# Output directory: dist/
```

## 🚀 Deployment

### Vercel
```bash
vercel
```

### Netlify
```bash
netlify deploy --prod
```

### Manual
1. Build project: `npm run build`
2. Upload `dist/` folder
3. Configure redirects for SPA

### Redirects (_redirects file)
```
/*    /index.html   200
```

## 🎨 Customization

### Theme Colors
Edit `tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      primary: { /* your colors */ }
    }
  }
}
```

### Layout
Modify `App.jsx` for global layout changes.

## 🔍 SEO

- Meta tags in `index.html`
- Dynamic titles per page
- Open Graph tags ready
- Sitemap generation recommended

## 📱 Responsive Design

All pages are fully responsive:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🧪 Testing

```bash
# Add testing library
npm install --save-dev @testing-library/react

# Run tests
npm test
```

## 📊 Performance

- Code splitting with React.lazy()
- Image optimization
- Lazy loading for routes
- React Query caching
- Vite's fast HMR

## 🐛 Debugging

Use React Developer Tools:
- Component inspector
- State viewer
- Performance profiler

## 🔧 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5173
npx kill-port 5173
```

### Module Not Found
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build Errors
```bash
# Clear Vite cache
rm -rf node_modules/.vite
npm run build
```

## 📚 Resources

- [React Docs](https://react.dev)
- [Vite Guide](https://vitejs.dev)
- [TailwindCSS](https://tailwindcss.com)
- [React Router](https://reactrouter.com)
- [Zustand](https://github.com/pmndrs/zustand)

---

For more information, see the main project README.
