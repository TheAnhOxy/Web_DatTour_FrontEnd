import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { Dashboard } from "./pages/Dashboard";
import { TourPage } from "./pages/TourPage";
import { PromotionPage } from "./pages/PromotionPage";
import { TourBookingPage } from "./pages/TourBookingPage";
import { PaymentPage } from "./pages/PaymentPage";
import { MessagesPage } from "./pages/MessagesPage";
import { UsersPage } from "./pages/UsersPage";
import BookingsPage from "./pages/BookingsPage";
import { PassengersPage } from "./pages/PassengersPage";
import { MainLayout } from "./components/MainLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";

const AppContent = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Login Page */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Dashboard Pages */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/tour"
        element={
          <ProtectedRoute>
            <MainLayout>
              <TourPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/promotion"
        element={
          <ProtectedRoute>
            <MainLayout>
              <PromotionPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/booking/tour"
        element={
          <ProtectedRoute>
            <MainLayout>
              <TourBookingPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/booking/payment"
        element={
          <ProtectedRoute>
            <MainLayout>
              <PaymentPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/messages"
        element={
          <ProtectedRoute>
            <MainLayout>
              <MessagesPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/users/passengers"
        element={
          <ProtectedRoute>
            <MainLayout>
              <PassengersPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/passengers"
        element={
          <ProtectedRoute>
            <MainLayout>
              <PassengersPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/bookings"
        element={
          <ProtectedRoute>
            <MainLayout>
              <BookingsPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/users"
        element={
          <ProtectedRoute>
            <MainLayout>
              <UsersPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Default Route */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" />
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      {/* 404 Route */}
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />}
      />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
