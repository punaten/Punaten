import { Box, CircleProgress, CircleProgressLabel } from "@yamada-ui/react";

const CircleTimerProgress = ({
  currentTimer,
  videoLength,
}: {
  currentTimer: number;
  videoLength: number;
}) => {
  let timerValue = 0;

  if (currentTimer > 0) {
    timerValue = (currentTimer / videoLength) * 100;
  } else if (currentTimer < -1500) {
    timerValue = 100;
  } else {
    timerValue = 0;
  }

  const intervalCount =
    -3000 < currentTimer && currentTimer < 0
      ? `${Math.floor(-currentTimer / 1000) + 1}`
      : "";

  return (
    <Box>
      <CircleProgress
        value={timerValue}
        color={"cinnamon"}
        trackColor={"caramel"}
        thickness={4}
        size={60}
      >
        <CircleProgressLabel color="cream">{intervalCount}</CircleProgressLabel>
      </CircleProgress>
    </Box>
  );
};

export default CircleTimerProgress;
