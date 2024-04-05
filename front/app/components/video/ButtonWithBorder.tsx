import { Button } from "@yamada-ui/react";
import { ReactNode } from "react";

const ButtonWithBorder = ({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
}) => {
  return (
    <Button
      fontSize={18}
      width={"full"}
      py={6}
      borderWidth={2}
      borderStyle={"solid"}
      borderColor={["cinnamon", "cream-dark"]}
      bg={["cream-light", "dark-caramel"]}
      color={["cinnamon", "cream-dark"]}
      onClick={onClick}
    >
      {children}
    </Button>
  );
};

export default ButtonWithBorder;
