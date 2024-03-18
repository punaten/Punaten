import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import {
  ThemeConfig,
  UIProvider,
  extendConfig,
  extendTheme,
} from "@yamada-ui/react";
import theme from "./theme";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export const config: ThemeConfig = {
  initialColorMode: "system",
};

const customConfig = extendConfig(config);

export default function App() {
  return (
    <UIProvider config={customConfig} theme={theme}>
      <Outlet />
    </UIProvider>
  );
}
