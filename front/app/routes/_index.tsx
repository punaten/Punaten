import type { MetaFunction } from "@remix-run/cloudflare";
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
  return <div>Hello World!</div>;
}
