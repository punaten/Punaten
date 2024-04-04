import { Link } from "@remix-run/react";
import { Button, Motion } from "@yamada-ui/react";
import MotionButton from "./global/MotionButton";
import { MouseEvent } from "react";

const LinkToTimeLine = () => {
  return (
    <Link to="/timeline" style={{ width: "fit-content" }}>
      <MotionButton onClick={() => {}}>みんなの猫ミームを見る</MotionButton>
    </Link>
  );
};

export default LinkToTimeLine;
