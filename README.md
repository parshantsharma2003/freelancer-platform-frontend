# FreelancePro Frontend

Production-ready React frontend for the FreelancePro platform. This repository contains the client application only: the UI, routing, state management, API integration, and real-time features that power the platform experience.

## Overview

FreelancePro Frontend is built with Vite and React 18, styled with Tailwind CSS, and designed to work with the backend API over REST and Socket.IO. It supports multiple user roles and includes flows for browsing jobs, posting work, messaging, contracts, payments, notifications, and admin management.

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- React Router DOM
- Zustand
- React Query
- Axios
- Socket.IO Client
- Framer Motion
- react-hook-form
- react-hot-toast
- Recharts

## Key Features

- Role-based authentication and protected routes
- Freelancer, client, admin, and super admin experiences
- Landing page with platform overview and onboarding entry points
- Job browsing, job details, posting, and editing flows
- Freelancer profile, saved jobs, proposals, and earnings views
- Chat, direct messaging, notifications, and real-time updates
- Contract and payment-related screens
- Analytics and dashboard views for platform management
- Responsive UI for mobile, tablet, and desktop

## Pages and Screens

The app includes pages such as:

- Landing, login, register, forgot password, verify email, and OAuth callback
- Dashboard, my jobs, browse jobs, job details, post job, edit job, saved jobs
- Freelancers, freelancer profile, proposals, proposal details
- Messages, chat, direct messages, notifications
- Contracts, contract details, payments, earnings
- Client onboarding and freelancer onboarding
- Admin dashboard, admin login, analytics
- About, how it works, careers, privacy, and terms

## Project Structure

```
src/
├── components/        # Shared UI and layout components
├── config/            # App configuration
├── context/           # React context providers
├── lib/               # API, socket, and utility helpers
├── pages/             # Route-level pages and screens
├── services/          # Service layer for backend calls
├── store/             # Zustand stores
├── App.jsx            # App routes and layout shell
├── main.jsx           # Vite entry point
└── index.css          # Global styles and Tailwind base styles
```

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm 9 or newer

### Installation

```bash
git clone <your-repo-url>
cd the-frontend
npm install
```

### Environment Variables

Create a `.env` file in the frontend root:

```env
VITE_API_URL=https://your-backend-domain.com/api
VITE_SOCKET_URL=https://your-backend-domain.com
```

If your backend is running locally:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### Run Locally

```bash
npm run dev
```

Open the app in the browser at the local Vite URL shown in the terminal.

## Available Scripts

```bash
npm run dev      # Start the Vite development server
npm run build    # Create a production build in dist/
npm run preview  # Preview the production build locally
npm run lint     # Run ESLint across the project
```

## Architecture Notes

- API requests are centralized through Axios-based helpers.
- Authentication and UI state are managed with Zustand.
- Server data and caching use React Query where appropriate.
- Real-time communication is handled with Socket.IO.
- Forms are built with react-hook-form for cleaner validation and submission flows.

## Deployment

This is a static frontend application after build, so it can be deployed to Vercel, Netlify, Azure Static Web Apps, or any static hosting platform.

### Build for Production

```bash
npm run build
```

The compiled output is generated in the `dist/` folder.

### SPA Routing

If you deploy to a static host, make sure client-side routes are redirected to `index.html`.

For Netlify, use:

```txt
/*    /index.html   200
```

For Azure Static Web Apps, the included `staticwebapp.config.json` can be used to configure routing.

## Customization

- Update the theme and Tailwind config in `tailwind.config.js`
- Adjust API endpoints through environment variables
- Extend routes and layouts in `App.jsx`
- Add new screens under `src/pages/`
- Reuse shared UI primitives from `src/components/`

## Responsive Design

The interface is built to adapt across screen sizes:

- Mobile: under 768px
- Tablet: 768px to 1024px
- Desktop: above 1024px

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npm run lint` and `npm run build`
5. Open a pull request

## License

Add your preferred license here before publishing publicly.
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
