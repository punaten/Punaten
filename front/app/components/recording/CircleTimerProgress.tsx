import { Box, CircleProgress, CircleProgressLabel } from "@yamada-ui/react";

const CircleTimerProgress = ({
  miniPhase,
  remainingTime,
  restTime,
  videoLength,
}: {
  miniPhase: number;
  remainingTime: number;
  restTime: number;
  videoLength: number;
}) => {
  let timerValue = 0;
  if (miniPhase === 0) {
    if (remainingTime < (restTime * 3) / 4) {
      timerValue = 100;
    } else {
      timerValue = 0;
    }
  } else {
    timerValue = (remainingTime / videoLength) * 100;
  }

  return (
    <Box opacity={20}>
      <CircleProgress
        value={timerValue}
        color={["cinnamon", "caramel"]}
        trackColor={["caramel", "dark-caramel"]}
        thickness={4}
        size={60}
        isAnimation={false}
      />
    </Box>
  );
};

export default CircleTimerProgress;
