import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { Box, CircularProgress } from '@mui/material';

// Lazy load components
const Login = lazy(() => import('./features/auth/Login'));
const Register = lazy(() => import('./features/auth/Register'));
const Dashboard = lazy(() => import('./features/dashboard/Dashboard'));
const BuildingTypes = lazy(() => import('./features/building-types/BuildingTypes'));
const Materials = lazy(() => import('./features/materials/Materials'));
const Projects = lazy(() => import('./features/projects/Projects'));
const Layout = lazy(() => import('./components/Layout'));

const LoadingFallback = () => (
  <Box 
    display="flex" 
    justifyContent="center" 
    alignItems="center" 
    minHeight="100vh"
  >
    <CircularProgress />
  </Box>
);

export default function AppRoutes() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="building-types" element={<BuildingTypes />} />
          <Route path="materials" element={<Materials />} />
          <Route path="projects" element={<Projects />} />
        </Route>
      </Routes>
    </Suspense>
  );
}