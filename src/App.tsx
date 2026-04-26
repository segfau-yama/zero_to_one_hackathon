import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { HeaderComponent } from "./components/HeaderComponent";
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

  const isWorkerOrAdmin = user.role === "worker" || user.role === "admin";
  const defaultPath = isWorkerOrAdmin ? "/map" : "/camera";

  return (
    <BrowserRouter>
      <Box sx={{ height: "100dvh", display: "flex", flexDirection: "column" }}>
        <HeaderComponent />
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
            <Route path="/" element={<Navigate to={defaultPath} replace />} />

            {/* user のみアクセス可能 */}
            <Route
              path="/camera"
              element={
                isWorkerOrAdmin ? (
                  <Navigate to="/map" replace />
                ) : (
                  <CameraComponent />
                )
              }
            />
            <Route
              path="/point"
              element={
                isWorkerOrAdmin ? (
                  <Navigate to="/map" replace />
                ) : (
                  <PointComponent />
                )
              }
            />

            {/* 全ロールアクセス可能 */}
            <Route path="/map" element={<MapComponent />} />
            <Route path="/admin" element={<div>管理者画面（準備中）</div>} />
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
