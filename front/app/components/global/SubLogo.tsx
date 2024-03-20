import { Box } from "@yamada-ui/react";
import { Link } from "@remix-run/react";
const SubLogo = () => {
  return (
    <Box position={"fixed"} top={4} left={4} zIndex={20}>
      <Link to={"/"}>
        <img src="/sub_logo.webp" alt="ダンスDE猫ミームのサブロゴ" width={274} height={56} />
      </Link>
    </Box>
  );
};

export default SubLogo;
