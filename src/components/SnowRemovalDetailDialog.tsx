import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Typography from "@mui/material/Typography";
import CardMedia from "@mui/material/CardMedia";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PersonIcon from "@mui/icons-material/Person";
import CommentIcon from "@mui/icons-material/Comment";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { SnowRemoval } from "../api/client";

interface SnowRemovalDetailDialogProps {
  open: boolean;
  selected: SnowRemoval | null;
  onClose: () => void;
  onMarkAsCleared: () => void;
  isWorker: boolean;
}

export function SnowRemovalDetailDialog({
  open,
  selected,
  onClose,
  onMarkAsCleared,
  isWorker,
}: SnowRemovalDetailDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>除雪箇所の詳細</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          {selected?.photo && (
            <CardMedia
              component="img"
              image={selected.photo}
              alt="除雪箇所の写真"
              sx={{ borderRadius: 1, maxHeight: 260, objectFit: "cover" }}
            />
          )}

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <PersonIcon color="action" fontSize="small" />
            <Typography variant="body1">
              <Typography component="span" fontWeight="bold">
                ユーザーID:{" "}
              </Typography>
              {selected?.user_id}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
            <CommentIcon color="action" fontSize="small" />
            <Typography variant="body1">
              <Typography component="span" fontWeight="bold">
                コメント:{" "}
              </Typography>
              {selected?.comment || "（なし）"}
            </Typography>
          </Box>

          <Divider />

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <LocationOnIcon color="action" fontSize="small" />
            <Chip
              label={`${selected?.latitude.toFixed(5)}, ${selected?.longitude.toFixed(5)}`}
              size="small"
              variant="outlined"
            />
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AccessTimeIcon color="action" fontSize="small" />
            <Typography variant="body2" color="text.secondary">
              {selected?.reg_date
                ? new Date(selected.reg_date).toLocaleString("ja-JP")
                : ""}
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          閉じる
        </Button>
        {isWorker && (
          <Button
            onClick={onMarkAsCleared}
            variant="contained"
            color="success"
            startIcon={<CheckCircleIcon />}
          >
            除雪完了
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default SnowRemovalDetailDialog;
