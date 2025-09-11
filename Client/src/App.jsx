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
import { ThemeProvider } from "./context/ThemeContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ModernDashboard from "./pages/ModernDashboard";
import Customer from "./pages/Customer";
import EnhancedCustomer from "./pages/EnhancedCustomer";
import EditCustomer from "./pages/EditCustomer";
import Upload from "./pages/Upload";
import Schedule from "./pages/Schedule";
import AdvancedSchedule from "./pages/AdvancedSchedule";
import PosterList from "./pages/PosterList";
import PosterTemplates from "./pages/PosterTemplates";
import WhatsAppMessaging from "./pages/WhatsAppMessaging";
import CustomerList from "./components/CustomerList";
import ScheduleList from "./pages/ScheduleList";
import Profile from "./pages/Profile";
import BulkCampaign from "./pages/BulkCampaign";
import SidebarLayout from "./components/SidebarLayout";
import './styles/animations.css';
import './styles/dark-theme.css';

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
        <Router
            future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
            }}
        >
            <AuthProvider>
                <ThemeProvider>
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
                                        <ModernDashboard />
                                    </SidebarLayout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/old-dashboard"
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
                            path="/poster-templates"
                            element={
                                <ProtectedRoute>
                                    <SidebarLayout>
                                        <PosterTemplates />
                                    </SidebarLayout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/whatsapp-messaging"
                            element={
                                <ProtectedRoute>
                                    <SidebarLayout>
                                        <WhatsAppMessaging />
                                    </SidebarLayout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/customer"
                            element={
                                <ProtectedRoute>
                                    <SidebarLayout>
                                        <EnhancedCustomer />
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
                            path="/bulk-campaign"
                            element={
                                <ProtectedRoute>
                                    <SidebarLayout>
                                        <BulkCampaign />
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
                                        <AdvancedSchedule />
                                    </SidebarLayout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/old-schedule"
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
                </ThemeProvider>
            </AuthProvider>
        </Router>
    );
};

export default App;
