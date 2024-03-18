import type { MetaFunction } from "@remix-run/cloudflare";
import {
  Box,
  Button,
  Center,
  Flex,
  Wrap,
  useColorMode,
} from "@yamada-ui/react";
export const meta: MetaFunction = () => {
  return [
    { title: "ダンスDE猫ミーム" },
    {
      name: "description",
      content: "ダンスを踊って猫ミームを自動生成するサイトです。",
    },
  ];
};

export default function Index() {
  const { colorMode, changeColorMode, toggleColorMode } = useColorMode();
  return (
    <Center h={"full"}>
      <Wrap gap="md" position={"fixed"} bottom={0} padding={10}>
        <Button onClick={() => changeColorMode("light")}>ライトモード</Button>
        <Button onClick={() => changeColorMode("dark")}>ダークモード</Button>
        <Button onClick={() => changeColorMode("system")}>システム</Button>
        <Button onClick={toggleColorMode}>
          {colorMode === "light" ? "ダーク" : "ライト"}モードに切り替える
        </Button>
      </Wrap>
      <Flex direction={"column"}>
        <img src="/logo.webp" alt="ロゴ" width={602} height={350} />
        <Center fontSize={48} pt={10}>
          - Tap to Start -
        </Center>
      </Flex>
    </Center>
  );
}
