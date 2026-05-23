import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useAuth } from "./context/AuthContext";
import socketService from "./services/socketService";
import { notificationAPI, proposalAPI } from "./services/api";
import { useNotificationStore } from "./store/notificationStore";
import { useProposalStore } from "./store/proposalStore";

// Pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import OAuthCallback from "./components/OAuthCallback";
import DashboardPage from "./pages/DashboardPage";
import BrowseJobsPage from "./pages/BrowseJobsPage";
import JobDetailsPage from "./pages/JobDetailsPage";
import PostJobPage from "./pages/PostJobPage";
import FreelancersPage from "./pages/FreelancersPage";
import FreelancerProfilePage from "./pages/FreelancerProfilePage";
import MyProfilePage from "./pages/MyProfilePage";
import FreelancerOnboardingPage from "./pages/FreelancerOnboardingPage";
import ClientOnboardingPage from "./pages/ClientOnboardingPage";
import MessagesPage from "./pages/MessagesPage";
import DirectMessagePage from "./pages/DirectMessagePage";
import ProposalsPage from "./pages/ProposalsPage";
import ProposalDetailsPage from "./pages/ProposalDetailsPage";
import ContractsPage from "./pages/ContractsPage";
import ContractDetails from "./pages/ContractDetails";
import ContractWorkspace from "./pages/contracts/ContractWorkspace"; // Added Import
import PaymentsPage from "./pages/PaymentsPage";
import NotificationsPage from "./pages/NotificationsPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import AboutUsPage from "./pages/AboutUsPage";
import CareersPage from "./pages/CareersPage";
import HowItWorksPage from "./pages/HowItWorksPage";
import MyJobsPage from "./pages/MyJobsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import SettingsPage from "./pages/SettingsPage";
import SavedJobsPage from "./pages/SavedJobsPage";
import EarningsPage from "./pages/EarningsPage";
import EditJobPage from "./pages/EditJobPage";

// Components
import ProtectedRoute from "./components/ProtectedRoute";
import NavbarResolver from "./components/NavbarResolver";
import Footer from "./components/Footer";
import { ToastContainer } from "./components/ui/Toast";

function App() {
  const { isAuthenticated, accessToken, user, isAuthResolved } = useAuth();
  const { addNotification, setUnreadCount } = useNotificationStore();
  const { setUnreadProposalCount, incrementUnreadProposalCount } =
    useProposalStore();

  const location = useLocation();

  /* -------------------------------------------------------------------------- */
  /* SOCKET SETUP                                */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    if (!isAuthResolved) return;

    const userId = user?.id || user?._id;

    if (isAuthenticated && accessToken && userId) {
      socketService.connect().then((connected) => {
        if (connected) {
          socketService.on("new_notification", (notification) => {
            addNotification(notification);
          });

          socketService.on("new_proposal", () => {
            if (user?.role === "client") {
              incrementUnreadProposalCount();
            }
          });
        }
      });
    } else {
      socketService.disconnect();
    }

    return () => {
      socketService.offAll("new_notification");
      socketService.offAll("new_proposal");
    };
  }, [
    isAuthenticated,
    accessToken,
    user?.id,
    user?._id,
    user?.role,
    isAuthResolved,
    addNotification,
    incrementUnreadProposalCount
  ]);

  /* -------------------------------------------------------------------------- */
  /* FETCH UNREAD NOTIFICATIONS                          */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    if (!isAuthResolved) return;

    if (!isAuthenticated || !user || user.role === "super_admin") {
      setUnreadCount(0);
      return;
    }

    notificationAPI
      .getUnreadCount()
      .then((res) => {
        setUnreadCount(res.data?.data?.count ?? 0);
      })
      .catch(() => setUnreadCount(0));
  }, [isAuthenticated, user, isAuthResolved, setUnreadCount]);

  /* -------------------------------------------------------------------------- */
  /* FETCH UNREAD PROPOSALS (CLIENT)                     */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    if (!isAuthResolved) return;

    if (!isAuthenticated || user?.role !== "client") {
      setUnreadProposalCount(0);
      return;
    }

    proposalAPI
      .getUnreadCount()
      .then((res) => {
        setUnreadProposalCount(res.data?.data?.count ?? 0);
      })
      .catch(() => setUnreadProposalCount(0));
  }, [isAuthenticated, user, isAuthResolved, setUnreadProposalCount]);

  /* -------------------------------------------------------------------------- */
  /* RENDER                                   */
  /* -------------------------------------------------------------------------- */

  return (
    <div className="flex flex-col">
      <ToastContainer />

      {isAuthResolved && <NavbarResolver />}

      <main className={`flex-grow ${isAuthResolved ? "pt-16" : ""}`}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>

            {/* -------------------- PUBLIC ROUTES -------------------- */}

            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
            <Route path="/oauth/callback" element={<OAuthCallback />} />
            <Route path="/browse-jobs" element={<BrowseJobsPage />} />
            <Route path="/jobs/:id" element={<JobDetailsPage />} />
            <Route path="/freelancers" element={<FreelancersPage />} />
            <Route path="/freelancers/:id" element={<FreelancerProfilePage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/about" element={<AboutUsPage />} />
            <Route path="/careers" element={<CareersPage />} />

            {/* -------------------- PROTECTED ROUTES -------------------- */}

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/my-jobs"
              element={
                <ProtectedRoute roles={["client"]}>
                  <MyJobsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/analytics"
              element={
                <ProtectedRoute roles={["client"]}>
                  <AnalyticsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/post-job"
              element={
                <ProtectedRoute roles={["client"]}>
                  <PostJobPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/edit-job/:jobId"
              element={
                <ProtectedRoute roles={["client"]}>
                  <EditJobPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/saved-jobs"
              element={
                <ProtectedRoute roles={["freelancer"]}>
                  <SavedJobsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/earnings"
              element={
                <ProtectedRoute roles={["freelancer"]}>
                  <EarningsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <MyProfilePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile/setup"
              element={
                <ProtectedRoute roles={["freelancer"]}>
                  <FreelancerOnboardingPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/client/profile/setup"
              element={
                <ProtectedRoute roles={["client"]}>
                  <ClientOnboardingPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/messages"
              element={
                <ProtectedRoute>
                  <MessagesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/messages/direct/:userId"
              element={
                <ProtectedRoute>
                  <DirectMessagePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/proposals"
              element={
                <ProtectedRoute>
                  <ProposalsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/proposals/:id"
              element={
                <ProtectedRoute>
                  <ProposalDetailsPage />
                </ProtectedRoute>
              }
            />

            {/* CONTRACT ROUTES */}

            <Route
              path="/contracts"
              element={
                <ProtectedRoute>
                  <ContractsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/contracts/:id"
              element={
                <ProtectedRoute>
                  <ContractDetails />
                </ProtectedRoute>
              }
            />

            {/* Added Workspace Route */}
            <Route
              path="/contracts/:id/workspace"
              element={
                <ProtectedRoute>
                  <ContractWorkspace />
                </ProtectedRoute>
              }
            />

            {/* PAYMENTS */}

            <Route
              path="/payments"
              element={
                <ProtectedRoute>
                  <PaymentsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <NotificationsPage />
                </ProtectedRoute>
              }
            />

            {/* -------------------- ADMIN ROUTES -------------------- */}

            <Route path="/admin/login" element={<AdminLoginPage />} />

            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute roles={["super_admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}

export default App;
