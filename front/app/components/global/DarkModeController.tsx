import { Button, Flex, Wrap, useColorMode } from "@yamada-ui/react";

const DarkModeController = () => {
  const { colorMode, changeColorMode, toggleColorMode } = useColorMode();

  return (
    <Button
      w={"fit-content"}
      position={"fixed"}
      onClick={toggleColorMode}
      top={0}
      right={0}
      margin={4}
      zIndex={100}
      rounded={"2rem"} 
      textAlign={"center"}
      // color={["cream-light", "cream-light"]}
      fontSize={16}
      // bg={["cinnamon", "#00000000"]}
      py={6}

    >
      {colorMode === "light" ? <img src="/bedtime.svg" /> : <img src="/light_mode.svg" />}
    </Button>
  );
};

export default DarkModeController;
