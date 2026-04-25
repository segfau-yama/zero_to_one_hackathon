import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import MapIcon from "@mui/icons-material/Map";
import StarIcon from "@mui/icons-material/Star";
import Paper from "@mui/material/Paper";
import Container from "@mui/material/Container";
import { useLocation, useNavigate } from "react-router-dom";

export function FooterComponent() {
  const navigate = useNavigate();
  const location = useLocation();

  const pathToValue: Record<string, number> = {
    "/camera": 0,
    "/map": 1,
    "/point": 2,
  };

  const value = pathToValue[location.pathname] ?? 0;

  return (
    <Paper
      sx={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 1000 }}
      elevation={3}
    >
      <Container maxWidth="md" disableGutters>
        <BottomNavigation
          value={value}
          onChange={(_, newValue) => {
            const paths = ["/camera", "/map", "/point"];
            navigate(paths[newValue]);
          }}
        >
          <BottomNavigationAction label="カメラ" icon={<CameraAltIcon />} />
          <BottomNavigationAction label="マップ" icon={<MapIcon />} />
          <BottomNavigationAction label="ポイント" icon={<StarIcon />} />
        </BottomNavigation>
      </Container>
    </Paper>
  );
}

export default FooterComponent;
