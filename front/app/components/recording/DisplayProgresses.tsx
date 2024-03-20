import { Flex } from "@yamada-ui/react";
import CircleTimerProgress from "./CircleTimerProgress";
import DotSetProgress from "./DotSetProgress";

const DisplayProgresses = ({
  phase,
  miniPhase,
  remainingTime,
  restTime,
  videoLength,
  setNum,
}: {
  phase: number;
  miniPhase: number;
  remainingTime: number;
  restTime: number;
  videoLength: number;
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
        miniPhase={miniPhase}
        remainingTime={remainingTime}
        restTime={restTime}
        videoLength={videoLength}
      />
      <DotSetProgress currentSet={phase} setNum={setNum} />
    </Flex>
  );
};

export default DisplayProgresses;
