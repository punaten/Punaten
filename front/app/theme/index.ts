import { extendTheme, UsageTheme } from "@yamada-ui/react";
import styles from "./styles";
// import components from './components'
import tokens from "./tokens";

const customTheme: UsageTheme = {
  styles,
  // components,
  ...tokens,
};

export default extendTheme(customTheme)({ omit: ["colors"] });
