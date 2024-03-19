import { Box, Flex } from "@yamada-ui/react";
import CircleTimerProgress from "./CircleTimerProgress";
import DotSetProgress from "./DotSetProgress";

const DisplayProgresses = ({
  currentTimer,
  videoLength,
  currentSet,
  setNum,
}: {
  currentTimer: number;
  videoLength: number;
  currentSet: number;
  setNum: number;
}) => {
  const timerValue = (currentTimer / videoLength) * 100;
  return (
    <Flex
      position={"fixed"}
      bottom={4}
      right={12}
      zIndex={5}
      gap={4}
      direction={"column"}
    >
      <CircleTimerProgress value={timerValue} />
      <DotSetProgress currentSet={currentSet} setNum={setNum} />
    </Flex>
  );
};

export default DisplayProgresses;
