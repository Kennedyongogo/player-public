import { ThemeProvider, CssBaseline } from "@mui/material";
import { theme } from "./theme";
import AuthPage from "./pages/AuthPage";

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthPage />
    </ThemeProvider>
  );
}
