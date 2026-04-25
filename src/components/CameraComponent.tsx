import { useRef, useState, useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import { SnowRemovalInputDialog } from "./SnowRemovalInputDialog";
import { useAuth } from "../context/AuthContext";
import { createSnowRemoval } from "../api/client";

export function CameraComponent() {
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [username, setUsername] = useState(user?.username ?? "");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [geoError, setGeoError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setCameraError(
        "カメラの起動に失敗しました。カメラへのアクセスを許可してください。",
      );
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const getLocation = (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => {
          // SecurityError: 自己署名証明書環境ではGeolocationがブロックされる場合がある
          if (err.code === err.PERMISSION_DENIED) {
            reject(new Error("位置情報の許可が必要です。"));
          } else {
            reject(err);
          }
        },
        { timeout: 5000 },
      );
    });
  };

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);

    const dataUrl = canvas.toDataURL("image/png");
    setCapturedImage(dataUrl);
    setSaved(false);
    setSaveError(null);

    try {
      const coords = await getLocation();
      setLocation(coords);
      setGeoError(null);
    } catch {
      setGeoError("位置情報の取得に失敗しました。");
      setLocation({ lat: 0, lng: 0 });
    }

    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!capturedImage || !location || !user) return;

    setSaving(true);
    setSaveError(null);

    try {
      await createSnowRemoval({
        latitude: location.lat,
        longitude: location.lng,
        comment,
        photo: capturedImage,
        user_id: user.id,
      });

      setSaved(true);
      setModalOpen(false);
      setComment("");
      setCapturedImage(null);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "送信に失敗しました。");
    } finally {
      setSaving(false);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setCapturedImage(null);
    setComment("");
    setSaveError(null);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        height: "100%",
        pb: 10,
        pt: 2,
        px: 1,
      }}
    >
      <Typography variant="h6" component="h1">
        除雪箇所を撮影する
      </Typography>

      {cameraError && (
        <Alert severity="error" sx={{ width: "100%" }}>
          {cameraError}
        </Alert>
      )}

      <Box
        sx={{
          width: "100%",
          flexGrow: 1,
          borderRadius: 2,
          overflow: "hidden",
          bgcolor: "common.black",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          component="video"
          ref={videoRef}
          autoPlay
          playsInline
          muted
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      </Box>

      <Box component="canvas" ref={canvasRef} sx={{ display: "none" }} />

      <Button
        variant="contained"
        color="primary"
        size="large"
        startIcon={<CameraAltIcon />}
        onClick={handleCapture}
        sx={{ borderRadius: 9999, px: 4 }}
        fullWidth
      >
        撮影する
      </Button>

      {saved && (
        <Alert severity="success" sx={{ width: "100%" }}>
          保存しました！マップで確認できます。
        </Alert>
      )}

      <SnowRemovalInputDialog
        open={modalOpen}
        capturedImage={capturedImage}
        geoError={geoError}
        location={location}
        username={username}
        comment={comment}
        saving={saving}
        saveError={saveError}
        onUsernameChange={setUsername}
        onCommentChange={setComment}
        onSave={handleSave}
        onClose={handleCloseModal}
      />
    </Box>
  );
}

export default CameraComponent;
