import { Button, Flex, Wrap, useColorMode } from "@yamada-ui/react";

const DarkModeController = () => {
  const { colorMode, changeColorMode, toggleColorMode } = useColorMode();

  return (
    <Button
      w={"fit-content"}
      position={"fixed"}
      onClick={toggleColorMode}
      bottom={0}
      left={0}
      margin={10}
      zIndex={100}
    >
      {colorMode === "light" ? "ダーク" : "ライト"}モードに切り替える
    </Button>
  );
};

export default DarkModeController;
