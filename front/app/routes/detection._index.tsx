import type { MetaFunction } from "@remix-run/cloudflare";
import { Link } from "@remix-run/react";
import { Box } from "@yamada-ui/react";
import HelloWasm from "~/components/HelloWasm";
import PoseDetection from "~/components/detection/PoseDetection";
export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    {
      name: "description",
      content: "Welcome to Remix! Using Vite and Cloudflare!",
    },
  ];
};

export default function Index() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <Box w="full" h="100dvh" bgGradient="linear(to-r, purple.500, blue.400)">
        <h1>Welcome to Remix (with Vite and Cloudflare)</h1>
        <ul>
          <li>
            <a
              target="_blank"
              href="https://developers.cloudflare.com/pages/framework-guides/deploy-a-remix-site/"
              rel="noreferrer"
            >
              Cloudflare Pages Docs - Remix guide
            </a>
          </li>
          <li>
            <a target="_blank" href="https://remix.run/docs" rel="noreferrer">
              Remix Docs
            </a>
          </li>
          <li>
            <Link to={"/createLearnData"}>createLearnData</Link>
          </li>
        </ul>
        <HelloWasm />
        <PoseDetection />
      </Box>
    </div>
  );
}
