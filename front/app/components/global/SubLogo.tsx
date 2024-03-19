import { Box } from "@yamada-ui/react";

const SubLogo = () => {
  return (
    <Box position={"fixed"} top={4} left={4} zIndex={20}>
      <img src="/sub_logo.webp" alt="サブロゴ" width={274} height={56} />
    </Box>
  );
};

export default SubLogo;
