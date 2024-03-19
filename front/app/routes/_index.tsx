import type { MetaFunction } from "@remix-run/cloudflare";
import { Center, Flex, Link, Motion } from "@yamada-ui/react";
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
  return (
    <Center
      w={"full"}
      h={"full"}
      bg={["cream-light", "dark-caramel"]}
      zIndex={50}
      position={"fixed"}
    >
      <Flex direction={"column"}>
        <Center>
          <Link href="/HowToPlay">
            <Motion
              as="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 1 }}
              whileFocus={{ scale: 1.05 }}
              p="md"
              rounded="md"
              bg="primary"
              color="white"
            >
              <img
                src="/logo.webp"
                alt="ダンスDE猫ミームのロゴ"
                width={602}
                height={350}
              />
            </Motion>
          </Link>
        </Center>
        <Center fontSize={48} pt={10}>
          - Click to Start -
        </Center>
      </Flex>
    </Center>
  );
}
