import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Customer from "./pages/Customer";
import EditCustomer from "./pages/EditCustomer";
import Upload from "./pages/Upload";
import Schedule from "./pages/Schedule";
import PosterList from "./pages/PosterList";
import CustomerList from "./components/CustomerList";
import ScheduleList from "./pages/ScheduleList";
import Profile from "./pages/Profile";
import SidebarLayout from "./components/SidebarLayout";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes with Sidebar */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <SidebarLayout>
                  <Dashboard />
                </SidebarLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/posterList"
            element={
              <ProtectedRoute>
                <SidebarLayout>
                  <PosterList />
                </SidebarLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers"
            element={
              <ProtectedRoute>
                <SidebarLayout>
                  <Customer />
                </SidebarLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers-list"
            element={
              <ProtectedRoute>
                <SidebarLayout>
                  <CustomerList />
                </SidebarLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers/edit/:id"
            element={
              <ProtectedRoute>
                <SidebarLayout>
                  <EditCustomer />
                </SidebarLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/upload"
            element={
              <ProtectedRoute>
                <SidebarLayout>
                  <Upload />
                </SidebarLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/schedule"
            element={
              <ProtectedRoute>
                <SidebarLayout>
                  <Schedule />
                </SidebarLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/schedule-list"
            element={
              <ProtectedRoute>
                <SidebarLayout>
                  <ScheduleList />
                </SidebarLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <SidebarLayout>
                  <Profile />
                </SidebarLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} />
      </AuthProvider>
    </Router>
  );
};

export default App;
