import { Box, Center, Flex } from "@yamada-ui/react";

const DotSetProgress = ({
  currentSet,
  setNum,
}: {
  currentSet: number;
  setNum: number;
}) => {
  const items = Array.from({ length: setNum }, (_, index) => {
    const num = index + 1;
    return {
      num,
      selected: num < currentSet,
    };
  });
  return (
    <Flex h={20} w={60} justifyContent={"space-around"}>
      {items.map((item) => (
        <Center
          key={item.num}
          bg={
            item.selected
              ? ["cinnamon", "caramel"]
              : ["caramel", "dark-caramel"]
          }
          rounded={32}
          width={16}
          height={16}
        >
          <Box
            color={
              item.selected
                ? ["caramel", "dark-caramel"]
                : ["cinnamon", "caramel"]
            }
            fontWeight={"bold"}
            fontSize={24}
          >
            {item.num}
          </Box>
        </Center>
      ))}
    </Flex>
  );
};

export default DotSetProgress;