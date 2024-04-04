import { Button, Motion } from "@yamada-ui/react";
import { ReactNode } from "react";

const MotionButtonWithBorder = ({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
}) => {
  return (
    <Motion
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 1 }}
      whileFocus={{ scale: 1.05 }}
      p="md"
      rounded="md"
      bg="primary"
      color="white"
    >
      <Button
        mx={"auto"}
        bg={["cream-light", "dark-caramel"]}
        color={["cinnamon", "cream-dark"]}
        fontSize={24}
        py={"3rem"}
        width={"25rem"}
        rounded={"2rem"}
        textAlign={"center"}
        borderWidth={4}
        borderStyle={"solid"}
        borderColor={["cinnamon", "cream-dark"]}
        onClick={onClick}
      >
        {children}
      </Button>
    </Motion>
  );
};

export default MotionButtonWithBorder;
