import { Box, Center, Flex } from "@yamada-ui/react";

const DotSetProgress = ({ value }: { value: number }) => {
  return (
    <Flex
      position={"fixed"}
      bottom={8}
      right={16}
      zIndex={5}
      h={20}
      w={60}
      justifyContent={"space-around"}
    >
      <Center bg={"cinnamon"} rounded={32} width={16} height={16}>
        <Box color={"cream-light"}>1</Box>
      </Center>
      <Center bg={"cinnamon"} rounded={32} width={16} height={16}>
        <Box color={"cream-light"}>2</Box>
      </Center>
      <Center bg={"cinnamon"} rounded={32} width={16} height={16}>
        <Box color={"cream-light"}>3</Box>
      </Center>
    </Flex>
  );
};

export default DotSetProgress;
