import type { MetaFunction } from "@remix-run/cloudflare";
import { Box } from "@yamada-ui/react";
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
  return <Box color={"primary.200"}>Hello World!</Box>;
}
