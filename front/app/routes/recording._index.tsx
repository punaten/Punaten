import { Box, Button, Center, Flex, Skeleton } from "@yamada-ui/react";
import { useRecording } from "~/components/detection/useRecording";
import DisplayProgresses from "~/components/recording/DisplayProgresses";
import { Link } from "@remix-run/react";

// export const action: ActionFunction = async () => {
//   const { arrayBuffer, blob } = await fetchFiles(); // データ取得

//   // ArrayBufferとBlobをBase64エンコード
//   const encodedArrayBuffer = Buffer.from(arrayBuffer).toString('base64');
//   const encodedBlob = Buffer.from(await blob.arrayBuffer()).toString('base64');

//   // リダイレクトとデータの受け渡し
//   return redirect(`/video?arrayBuffer=${encodedArrayBuffer}&blob=${encodedBlob}`);
// };

//string[]の配列をクエリに変換
const ArraytoQuery = (array: string[]) => {
  return array.map((value, index) => `array[${index}]=${value}`).join("&");
};

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
    catKind,
  } = useRecording();

  return (
    <Center h={"full"}>
      <video ref={videoRef} style={{ display: "none" }}>
        <track kind="captions" />
      </video>
      {phase !== 4 ? (
        <Box>
          <Flex
            direction={"column"}
            bg={["cream-dark", "dark-caramel"]}
            px={16}
            py={12}
            gap={10}
          >
            <Box>
              <canvas
                ref={canvasRef}
                style={{
                  width: "40rem",
                  height: "30rem",
                  visibility: miniPhase === 0 ? "hidden" : "visible",
                }}
              />
              {miniPhase === 0 &&
                remainingTime < 3000 &&
                phase !== 0 &&
                phase !== 4 && (
                  <Center
                    w={"40rem"}
                    h={"30rem"}
                    mt={"-30rem"}
                    fontSize={"20rem"}
                  >
                    {Math.floor((remainingTime + 1000) / 1000)}
                  </Center>
                )}
              {miniPhase === 0 && remainingTime >= 3000 && (
                <Center w={"40rem"} h={"30rem"} mt={"-30rem"} fontSize={"6rem"}>
                  ~ {phase}こめ ~
                </Center>
              )}
            </Box>
            <Flex
              w={"full"}
              h={"full"}
              justifyContent={"space-evenly"}
              alignItems={"center"}
              gap={4}
            >
              {" "}
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
        </Box>
      ) : (
        <Flex w={"full"} justifyContent={"center"}>
          <Link to={`/video?${ArraytoQuery(catKind)}`}>
            <Box
              fontSize={18}
              width={"full"}
              py={3}
              px={36}
              bg={["cinnamon", "caramel"]}
              color={["cream", "dark"]}
              onClick={finishRecording}
              w={"fit-content"}
              rounded={8}
            >
              動画を生成
            </Box>
          </Link>
        </Flex>
      )}
      <DisplayProgresses
        phase={phase}
        miniPhase={miniPhase}
        remainingTime={remainingTime}
        restTime={restTime}
        videoLength={videoLength}
        setNum={setNum}
      />
    </Center>
  );
}
