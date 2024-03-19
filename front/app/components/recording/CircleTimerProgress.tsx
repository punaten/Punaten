import { Box, CircleProgress } from "@yamada-ui/react";

const CircleTimerProgress = ({ value }: { value: number }) => {
  return (
    <Box>
      <CircleProgress
        value={value}
        color={"cinnamon"}
        trackColor={"caramel"}
        thickness={4}
        size={60}
      />
    </Box>
  );
};

export default CircleTimerProgress;
