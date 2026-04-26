import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import AcUnitIcon from "@mui/icons-material/AcUnit";
import LogoutIcon from "@mui/icons-material/Logout";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function HeaderComponent() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
  };

  return (
    <AppBar position="static" color="primary" elevation={2}>
      <Toolbar sx={{ gap: 1 }}>
        {/* ロゴ + タイトル */}
        <AcUnitIcon />
        <Typography variant="h6" fontWeight="bold" sx={{ flexGrow: 1 }}>
          ジョセツ・ジョースター
        </Typography>

        {/* 管理者画面ボタン (adminのみ) */}
        {user?.role === "admin" && (
          <Tooltip title="管理者画面">
            <Button
              color="inherit"
              startIcon={<AdminPanelSettingsIcon />}
              onClick={() => navigate("/admin")}
              size="small"
            >
              管理
            </Button>
          </Tooltip>
        )}

        {/* ログアウトボタン */}
        <Tooltip title="ログアウト">
          <IconButton color="inherit" onClick={handleLogout} edge="end">
            <LogoutIcon />
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
}

export default HeaderComponent;
