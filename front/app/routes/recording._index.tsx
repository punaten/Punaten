import { Box, Button, Center, Flex } from "@yamada-ui/react";
import { useRecording } from "~/components/detection/useRecording";
import DisplayProgresses from "~/components/recording/DisplayProgresses";

export default function Index() {
  const {
    videoRef,
    canvasRef,
    videoLength,
    restTime,
    setNum,
    startRecording,
    restartRecording,
    cancelRecording,
    finishRecording,
    remainingTime,
    phase,
    miniPhase,
  } = useRecording();

  return (
    <Center h={"full"}>
      <video ref={videoRef} style={{ display: "none" }}>
        <track kind="captions" />
      </video>
      <Flex
        direction={"column"}
        bg={["cream-dark", "dark-caramel"]}
        px={16}
        py={12}
        gap={10}
      >
        <canvas
          ref={canvasRef}
          style={{
            width: "40rem",
            height: "30rem",
            visibility: miniPhase === 0 ? "hidden" : "visible",
          }}
        />
        <Flex
          w={"full"}
          h={"full"}
          justifyContent={"space-evenly"}
          alignItems={"center"}
          gap={4}
        >
          <Button
            fontSize={18}
            width={"full"}
            py={6}
            bg={["cinnamon", "cream-dark"]}
            color={["cream-light", "dark"]}
            onClick={startRecording}
          >
            録画開始
          </Button>
          <Button
            fontSize={18}
            width={"full"}
            py={6}
            bg={["cinnamon", "cream-dark"]}
            color={["cream-light", "dark"]}
            onClick={restartRecording}
          >
            録り直し
          </Button>
          <Button
            fontSize={18}
            width={"full"}
            py={6}
            bg={["cinnamon", "cream-dark"]}
            color={["cream-light", "dark"]}
            onClick={cancelRecording}
          >
            キャンセル
          </Button>
          <Button
            fontSize={18}
            width={"full"}
            py={6}
            bg={["cinnamon", "cream-dark"]}
            color={["cream-light", "dark"]}
            onClick={finishRecording}
          >
            録画終了
          </Button>
        </Flex>
      </Flex>
      <Box position={"fixed"} left={10}>
        <Box>phase{phase}</Box>
        <Box>miniphase;{miniPhase}</Box>
        <Box>{remainingTime}</Box>
      </Box>
      <DisplayProgresses
        currentTimer={
          miniPhase ? videoLength - remainingTime : remainingTime / restTime
        }
        videoLength={videoLength}
        currentSet={phase}
        setNum={setNum}
      />
    </Center>
  );
}
