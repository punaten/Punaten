import type { MetaFunction } from "@remix-run/cloudflare";
import { Box, Button, Wrap, useColorMode } from "@yamada-ui/react";
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
    <Box>
      <Wrap gap="md" position={"fixed"} bottom={0} padding={10}>
        <Button onClick={() => changeColorMode("light")}>ライトモード</Button>
        <Button onClick={() => changeColorMode("dark")}>ダークモード</Button>
        <Button onClick={() => changeColorMode("system")}>システム</Button>
        <Button onClick={toggleColorMode}>
          {colorMode === "light" ? "ダーク" : "ライト"}モードに切り替える
        </Button>
      </Wrap>
      <Box color={["blue.700", "primary.400"]}>Hello World!</Box>
    </Box>
  );
}
