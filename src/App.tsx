import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { FooterComponent } from "./components/FooterComponent";
import { CameraComponent } from "./components/CameraComponent";
import { MapComponent } from "./components/MapComponent";
import { PointComponent } from "./components/PointComponent";
import { LoginComponent } from "./components/LoginComponent";
import "./index.css";

function AppContent() {
  const { user } = useAuth();

  if (!user) {
    return <LoginComponent />;
  }

  return (
    <BrowserRouter>
      <Box sx={{ height: "100dvh", display: "flex", flexDirection: "column" }}>
        <Container
          maxWidth="md"
          disableGutters
          sx={{
            flex: 1,
            minHeight: 0,
            overflow: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Routes>
            <Route path="/" element={<Navigate to="/camera" replace />} />
            <Route path="/camera" element={<CameraComponent />} />
            <Route path="/map" element={<MapComponent />} />
            <Route path="/point" element={<PointComponent />} />
          </Routes>
        </Container>
        <FooterComponent />
      </Box>
    </BrowserRouter>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
