import { useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import AcUnitIcon from "@mui/icons-material/AcUnit";
import { useAuth } from "../context/AuthContext";
import { login } from "../api/client";

export function LoginComponent() {
  const { login: setAuth } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const user = await login({ username, password });
      setAuth({
        id: user.id,
        username: user.username,
        isWorker: user.role === "worker",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "ログインに失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        height: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "primary.main",
        px: 2,
      }}
    >
      <Card
        elevation={6}
        sx={{
          width: "100%",
          maxWidth: { xs: "100%", sm: 400 },
          borderRadius: 3,
        }}
      >
        <CardContent>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              py: 2,
            }}
          >
            <AcUnitIcon sx={{ fontSize: 56 }} color="primary" />
            <Typography variant="h5" fontWeight="bold">
              除雪マップ
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ログインしてください
            </Typography>
          </Box>

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              mt: 1,
            }}
          >
            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              label="ユーザー名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              fullWidth
              required
              autoComplete="username"
            />
            <TextField
              label="パスワード"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              required
              autoComplete="current-password"
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading || !username.trim() || !password.trim()}
              sx={{ borderRadius: 9999 }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "ログイン"
              )}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default LoginComponent;
