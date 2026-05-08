import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LoginPage } from "./pages/LoginPage";
import { Dashboard } from "./pages/Dashboard";
import { TourPage } from "./pages/TourPage";
import { TourDetailPage } from "./pages/TourDetailPage";
import { TourCategoryPage } from "./pages/TourCategoryPage";
import { TourDestinationPage } from "./pages/TourDestinationPage";
import { PromotionPage } from "./pages/PromotionPage";
import { TourCreatePage } from "./pages/TourCreatePage";
import { TourBookingPage } from "./pages/TourBookingPage";
import { PaymentPage } from "./pages/PaymentPage";
import { MessagesPage } from "./pages/MessagesPage";
import { PassengersPage } from "./pages/PassengersPage";
import { MainLayout } from "./components/MainLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";

const AppContent = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Login Page */}
      <Route path="/login" element={<LoginPage />} />

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
        path="/tour/new"
        element={
          <ProtectedRoute>
            <MainLayout>
              <TourCreatePage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/tour/:id"
        element={
          <ProtectedRoute>
            <MainLayout>
              <TourDetailPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/tour/categories"
        element={
          <ProtectedRoute>
            <MainLayout>
              <TourCategoryPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/tour/destinations"
        element={
          <ProtectedRoute>
            <MainLayout>
              <TourDestinationPage />
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
