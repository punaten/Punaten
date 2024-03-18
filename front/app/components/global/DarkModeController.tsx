import { Button, Wrap, useColorMode } from "@yamada-ui/react";

const DarkModeController = () => {
  const { colorMode, changeColorMode, toggleColorMode } = useColorMode();

  return (
    <Wrap gap="md" position={"fixed"} bottom={0} padding={10}>
      <Button onClick={() => changeColorMode("light")}>ライトモード</Button>
      <Button onClick={() => changeColorMode("dark")}>ダークモード</Button>
      <Button onClick={() => changeColorMode("system")}>システム</Button>
      <Button onClick={toggleColorMode}>
        {colorMode === "light" ? "ダーク" : "ライト"}モードに切り替える
      </Button>
    </Wrap>
  );
};

export default DarkModeController;
