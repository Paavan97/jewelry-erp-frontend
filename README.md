# Jewellery ERP Frontend

React + Vite + TypeScript frontend application for the Jewellery ERP system.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Create a `.env` file in the frontend directory:
   ```env
   VITE_API_BASE_URL=http://localhost:3000/api
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

The application will start on `http://localhost:5173` (or the next available port).

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
  api/
    client.ts          # Axios client with JWT interceptor
    auth.ts            # Authentication API calls
  components/
    Layout/
      AuthLayout.tsx   # Layout for auth pages
      DashboardLayout.tsx  # Layout for dashboard pages
    UI/
      TextFieldControl.tsx  # Form text field component
      SubmitButton.tsx      # Submit button with loading state
    ProtectedRoute.tsx     # Route protection component
  hooks/
    useAuth.ts         # Authentication hook
  pages/
    Login.tsx          # Login page
    Dashboard.tsx      # Dashboard page
  App.tsx              # Main app component with routing
  main.tsx             # Entry point
  theme.ts             # Material-UI theme configuration
```

## Features

- **JWT Authentication**: Automatic token management with localStorage
- **Protected Routes**: Automatic redirect to login if not authenticated
- **Material-UI Theme**: Custom theme with ERP-appropriate colors
- **React Query**: Data fetching and caching
- **React Hook Form**: Form validation with Zod

## Color Scheme

The application uses a strict color palette:
- **Primary**: `#5e3b63` (Purple)
- **Background**: `#0d0421` (Dark blue)
- **Text Primary**: `#ffffff` (White)
- **Text Secondary**: `#000000` (Black)
