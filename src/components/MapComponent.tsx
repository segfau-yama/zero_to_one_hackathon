import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import "leaflet/dist/leaflet.css";
import { useAuth } from "../context/AuthContext";
import {
  getSnowRemovals,
  markAsCleared,
  deleteSnowRemoval,
  createPoint,
  getSnowRemovalById,
  type SnowRemoval,
} from "../api/client";
import { SnowRemovalDetailDialog } from "./SnowRemovalDetailDialog";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
}

interface LeafletMapProps {
  center: { lat: number; lng: number };
  dataList: SnowRemoval[];
  onMarkerClick: (data: SnowRemoval) => void;
}

function LeafletMap({ center, dataList, onMarkerClick }: LeafletMapProps) {
  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={13}
      style={{
        height: "100%",
        width: "100%",
        position: "absolute",
        inset: 0,
      }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <RecenterMap lat={center.lat} lng={center.lng} />
      {dataList.map((data) => (
        <Marker
          key={data.id}
          position={[data.latitude, data.longitude]}
          eventHandlers={{ click: () => onMarkerClick(data) }}
        >
          <Popup>報告 #{data.id}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export function MapComponent() {
  const { user } = useAuth();
  const [dataList, setDataList] = useState<SnowRemoval[]>([]);
  const [selected, setSelected] = useState<SnowRemoval | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState({
    lat: 38.2682,
    lng: 140.8694,
  });

  const loadSnowRemovals = async () => {
    try {
      const list = await getSnowRemovals();
      setDataList(list.filter((d) => !d.iscleared));
      setLoadError(null);
    } catch {
      setLoadError("データの取得に失敗しました。");
    }
  };

  useEffect(() => {
    setMounted(true);
    loadSnowRemovals();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          }),
        () => {},
      );
    }

    return () => {
      setMounted(false);
    };
  }, []);

  const handleMarkerClick = async (data: SnowRemoval) => {
    try {
      // ピン押下時に詳細（写真・コメント・登録日）を取得
      const detail = await getSnowRemovalById(data.id);
      setSelected(detail);
    } catch {
      // 取得失敗時はマップ一覧のデータをそのまま使う
      setSelected(data);
    }
    setModalOpen(true);
  };

  const handleMarkAsCleared = async () => {
    if (!selected || !user) return;
    try {
      await markAsCleared(selected.id);
      await createPoint({ point: 100, user_id: user.id });
      await deleteSnowRemoval(selected.id);
      setDataList((prev) => prev.filter((d) => d.id !== selected.id));
      setModalOpen(false);
      setSelected(null);
    } catch {
      // エラーは無視してモーダルを閉じる
      setModalOpen(false);
      setSelected(null);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelected(null);
  };

  return (
    <Box
      sx={{
        height: "100%",
        width: "100%",
        pb: 8,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Typography variant="h6" sx={{ textAlign: "center", mt: 2, mb: 1 }}>
        除雪箇所マップ
      </Typography>

      {loadError && (
        <Alert severity="error" sx={{ mx: 2, mb: 1 }}>
          {loadError}
        </Alert>
      )}

      <Box sx={{ flex: 1, minHeight: 0, position: "relative" }}>
        {mounted && (
          <LeafletMap
            center={userLocation}
            dataList={dataList}
            onMarkerClick={handleMarkerClick}
          />
        )}
      </Box>

      {dataList.length === 0 && !loadError && (
        <Alert severity="info" sx={{ mx: 2, mt: 1 }}>
          除雪箇所の報告がまだありません。
        </Alert>
      )}

      <SnowRemovalDetailDialog
        open={modalOpen}
        selected={selected}
        onClose={handleCloseModal}
        onMarkAsCleared={handleMarkAsCleared}
        isWorker={user?.isWorker ?? false}
      />
    </Box>
  );
}

export default MapComponent;
