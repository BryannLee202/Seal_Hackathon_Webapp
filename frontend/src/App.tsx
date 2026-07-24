import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { DashboardPage } from "./pages/DashboardPage";
import { EventsPage } from "./pages/coordinator/EventsPage";
import { EventDetailPage } from "./pages/coordinator/EventDetailPage";
import { UsersApprovalPage } from "./pages/coordinator/UsersApprovalPage";
import { MyTeamPage } from "./pages/team/MyTeamPage";
import { JudgePage } from "./pages/judge/JudgePage";
import { RankingPage } from "./pages/public/RankingPage";
import { ToastContainer } from "./components/Toast";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastContainer />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rankings"
            element={
              <ProtectedRoute>
                <RankingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-team"
            element={
              <ProtectedRoute>
                <MyTeamPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/judge"
            element={
              <ProtectedRoute requireRole="JUDGE">
                <JudgePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/coordinator/events"
            element={
              <ProtectedRoute requireRole="COORDINATOR">
                <EventsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/coordinator/events/:eventId"
            element={
              <ProtectedRoute requireRole="COORDINATOR">
                <EventDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/coordinator/users"
            element={
              <ProtectedRoute requireRole="COORDINATOR">
                <UsersApprovalPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
