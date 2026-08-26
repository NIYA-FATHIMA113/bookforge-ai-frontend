import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import BusinessManagement from "./pages/BusinessManagement";
import AISetup from "./pages/AISetup";
import { useAuth } from "./context/AuthContext";
import PublicBooking from "./pages/PublicBooking";


function App() {
  const { isAuthenticated } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* Login */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Login />
            )
          }
        />

        {/* Register */}
        <Route
          path="/register"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Register />
            )
          }
        />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              <Dashboard />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Manage Business */}
        <Route
          path="/dashboard/business/:tenantId"
          element={
            isAuthenticated ? (
              <BusinessManagement />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        {/* Public Booking */}
        <Route
          path="/book/:slug"
          element={<PublicBooking />}
        />
        {/* Unknown URL */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
        <Route
        path="/ai-setup"
        element={
          isAuthenticated ? (
            <AISetup />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      </Routes>
    </BrowserRouter>
  );
}

export default App;