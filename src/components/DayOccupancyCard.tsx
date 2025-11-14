// components/DayOccupancyCard.tsx
import { Card, CardContent, Typography, LinearProgress, Box } from "@mui/material";
import { Appointment } from "../types";
import { calculateDayOccupancy } from "../utils/occupancy";

interface Props {
  appointments: Appointment[];
}

export const DayOccupancyCard: React.FC<Props> = ({ appointments }) => {
  const { occupiedSlots, freeSlots, totalSlots, occupancyPercent } =
    calculateDayOccupancy(appointments);

  return (
    <Card>
      <CardContent>
        <Typography variant="subtitle2" color="text.secondary">
          Ocupación del día
        </Typography>
        <Typography variant="h4">
          {occupancyPercent}%
        </Typography>
        <Box mt={2}>
          <LinearProgress
            variant="determinate"
            value={occupancyPercent}
          />
        </Box>
        <Box mt={1}>
          <Typography variant="body2" color="text.secondary">
            Turnos ocupados: {occupiedSlots} / {totalSlots}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Turnos libres: {freeSlots}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default DayOccupancyCard;