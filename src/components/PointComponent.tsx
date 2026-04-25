import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import StarIcon from "@mui/icons-material/Star";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import { useAuth } from "../context/AuthContext";
import { getPointsByUser, Point } from "../api/client";

type RankInfo = {
  label: string;
  color:
    | "default"
    | "primary"
    | "secondary"
    | "warning"
    | "success"
    | "error"
    | "info";
  icon: React.ReactElement;
};

function getRank(total: number): RankInfo {
  if (total >= 1000)
    return {
      label: "ゴールド",
      color: "warning",
      icon: <WorkspacePremiumIcon />,
    };
  if (total >= 500)
    return {
      label: "シルバー",
      color: "default",
      icon: <WorkspacePremiumIcon />,
    };
  if (total >= 100)
    return { label: "ブロンズ", color: "secondary", icon: <EmojiEventsIcon /> };
  return { label: "ルーキー", color: "primary", icon: <StarIcon /> };
}

export function PointComponent() {
  const { user } = useAuth();
  const [records, setRecords] = useState<Point[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setFetchError(null);

    getPointsByUser(user.id)
      .then((list) => {
        setRecords(list);
        setTotal(list.reduce((sum, r) => sum + r.point, 0));
      })
      .catch((err) => {
        setFetchError(
          err instanceof Error ? err.message : "ポイントの取得に失敗しました。",
        );
      })
      .finally(() => setLoading(false));
  }, [user]);

  const rank = getRank(total);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        px: 2,
        pt: 3,
        pb: 10,
        gap: 3,
        width: "100%",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          maxWidth: { xs: "100%", sm: 480 },
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          マイポイント
        </Typography>
        {user && <Chip label={user.username} variant="outlined" size="small" />}
      </Box>

      {loading && <CircularProgress />}

      {fetchError && (
        <Alert
          severity="error"
          sx={{ width: "100%", maxWidth: { xs: "100%", sm: 480 } }}
        >
          {fetchError}
        </Alert>
      )}

      {!loading && !fetchError && (
        <>
          {/* 合計ポイントカード */}
          <Card
            elevation={4}
            sx={{
              width: "100%",
              maxWidth: { xs: "100%", sm: 480 },
              bgcolor: "primary.main",
              color: "primary.contrastText",
              borderRadius: 3,
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 1,
                  py: 2,
                }}
              >
                <StarIcon fontSize="large" color="warning" />
                <Typography variant="h3" fontWeight="bold">
                  {total.toLocaleString()}
                </Typography>
                <Typography variant="subtitle1">ポイント</Typography>
                <Chip
                  icon={rank.icon}
                  label={`${rank.label}ランク`}
                  color={rank.color}
                  variant="filled"
                />
              </Box>
            </CardContent>
          </Card>

          {/* ポイント獲得基準 */}
          <Card
            elevation={1}
            sx={{
              width: "100%",
              maxWidth: { xs: "100%", sm: 480 },
              borderRadius: 2,
            }}
          >
            <CardContent>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                ポイント獲得基準
              </Typography>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <Typography variant="body2">除雪完了 1件</Typography>
                <Typography variant="body2" color="text.secondary">
                  =
                </Typography>
                <Chip
                  label="100 pt"
                  color="primary"
                  size="small"
                  variant="outlined"
                />
              </Stack>
            </CardContent>
          </Card>

          {/* 獲得履歴 */}
          <Box
            sx={{
              width: "100%",
              maxWidth: { xs: "100%", sm: 480 },
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
          >
            <Typography variant="subtitle1" fontWeight="bold">
              獲得履歴
            </Typography>
            <Divider />
            {records.length === 0 ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  py: 3,
                  gap: 1,
                }}
              >
                <EmojiEventsIcon fontSize="large" color="disabled" />
                <Typography
                  color="text.secondary"
                  variant="body2"
                  sx={{ textAlign: "center" }}
                >
                  まだポイントがありません。
                </Typography>
                <Typography
                  color="text.secondary"
                  variant="body2"
                  sx={{ textAlign: "center" }}
                >
                  除雪を完了するとポイントが貯まります！
                </Typography>
              </Box>
            ) : (
              <List disablePadding>
                {[...records].reverse().map((record) => (
                  <ListItem
                    key={record.id}
                    divider
                    disableGutters
                    secondaryAction={
                      <Chip
                        label={`+${record.point} pt`}
                        color="primary"
                        size="small"
                        variant="outlined"
                      />
                    }
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <EmojiEventsIcon color="warning" />
                    </ListItemIcon>
                    <ListItemText
                      primary={`除雪完了ポイント`}
                      secondary={new Date(record.add_date).toLocaleString(
                        "ja-JP",
                      )}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </>
      )}
    </Box>
  );
}

export default PointComponent;
