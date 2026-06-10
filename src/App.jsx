import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ThemeProvider, CssBaseline, Box, CircularProgress } from "@mui/material";
import { theme } from "./theme";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AuthPage from "./pages/AuthPage";
import AppLayout from "./components/AppLayout";
import WalletPage from "./pages/WalletPage";
import SettingsPage from "./pages/SettingsPage";

function BootScreen() {
  return (
    <Box sx={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#050508" }}>
      <CircularProgress sx={{ color: "#F5C518" }} />
    </Box>
  );
}

function LoginRoute() {
  const { isAuthenticated, booting } = useAuth();
  if (booting) return <BootScreen />;
  if (isAuthenticated) return <Navigate to="/wallet" replace />;
  return <AuthPage />;
}

function RootRedirect() {
  const { isAuthenticated, booting } = useAuth();
  if (booting) return <BootScreen />;
  return <Navigate to={isAuthenticated ? "/wallet" : "/login"} replace />;
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={<LoginRoute />} />
            <Route element={<AppLayout />}>
              <Route path="/wallet" element={<WalletPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<RootRedirect />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
