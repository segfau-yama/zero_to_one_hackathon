import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import CardMedia from "@mui/material/CardMedia";
import CircularProgress from "@mui/material/CircularProgress";
import LocationOnIcon from "@mui/icons-material/LocationOn";

interface SnowRemovalInputDialogProps {
  open: boolean;
  capturedImage: string | null;
  geoError: string | null;
  location: { lat: number; lng: number } | null;
  username: string;
  comment: string;
  saving?: boolean;
  saveError?: string | null;
  onUsernameChange: (value: string) => void;
  onCommentChange: (value: string) => void;
  onSave: () => void;
  onClose: () => void;
}

export function SnowRemovalInputDialog({
  open,
  capturedImage,
  geoError,
  location,
  username,
  comment,
  saving = false,
  saveError = null,
  onUsernameChange,
  onCommentChange,
  onSave,
  onClose,
}: SnowRemovalInputDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>除雪箇所の情報を入力</DialogTitle>
      <DialogContent>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            mt: 1,
          }}
        >
          {capturedImage && (
            <CardMedia
              component="img"
              image={capturedImage}
              alt="撮影した写真"
              sx={{ borderRadius: 1, width: "100%" }}
            />
          )}

          {geoError && <Alert severity="warning">{geoError}</Alert>}
          {saveError && <Alert severity="error">{saveError}</Alert>}

          {location && location.lat !== 0 && (
            <Chip
              icon={<LocationOnIcon />}
              label={`${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`}
              variant="outlined"
              size="small"
              color="primary"
            />
          )}

          <TextField
            label="ユーザー名"
            value={username}
            onChange={(e) => onUsernameChange(e.target.value)}
            fullWidth
            required
          />
          <TextField
            label="コメント"
            value={comment}
            onChange={(e) => onCommentChange(e.target.value)}
            fullWidth
            multiline
            rows={3}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit" disabled={saving}>
          キャンセル
        </Button>
        <Button
          onClick={onSave}
          variant="contained"
          disabled={!username.trim() || saving}
          startIcon={
            saving ? <CircularProgress size={16} color="inherit" /> : undefined
          }
        >
          {saving ? "送信中..." : "保存する"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default SnowRemovalInputDialog;
