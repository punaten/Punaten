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
  return (
    <Flex
      position={"fixed"}
      bottom={4}
      right={12}
      zIndex={5}
      gap={4}
      direction={"column"}
    >
      <CircleTimerProgress
        currentTimer={currentTimer}
        videoLength={videoLength}
      />
      <DotSetProgress currentSet={currentSet} setNum={setNum} />
    </Flex>
  );
};

export default DisplayProgresses;
