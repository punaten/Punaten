import { Center, Flex, Link, Motion } from "@yamada-ui/react";
import DarkModeController from "~/components/global/DarkModeController";
import SubLogo from "~/components/global/SubLogo";

export default function Index() {
  return (
    <Center bg={["cream-dark", "dark"]} h={"full"} >
      <DarkModeController />
      <SubLogo/>
    </Center>
  );
}
