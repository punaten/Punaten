import { Center, Container, Text } from "@yamada-ui/react";
import { Link } from "@remix-run/react";
import MotionButton from "~/components/global/MotionButton";

const HowToPlay = () => {
  return (
    <Center h={"full"}>
      <Container>
        <Container
          mt={"5rem"}
          bg={["cream-light", "dark-caramel"]}
          border={"0.25rem solid"}
          borderColor={["cinnamon", "dark-caramel"]}
          rounded={"0.5rem"}
        >
          <Text
            as={"h1"}
            fontSize={"3rem"}
            w={"fit-content"}
            m={"auto"}
            color={["cinnamon", "caramel"]}
          >
            遊び方
          </Text>
          <Center>
            <Text
              className="description"
              text={"2rem"}
              color={["cinnamon", "caramel"]}
            >
              Startボタンを押すと30秒の録画が始まります。
              <br />
              全力で猫ミームの真似をしてください。
              <br />
              全力で踊ってください。
              <br />
              30秒経過すると自動的に録画が終了し、猫ミーム
              <br />
              の生成が始まります。
            </Text>
          </Center>
        </Container>
        <Container>
          <Link
            to="/recording"
            className="start-btn"
            style={{ width: "fit-content", margin: "0 auto" }}
          >
            <MotionButton onClick={() => {}}>Start</MotionButton>
          </Link>
        </Container>
      </Container>
    </Center>
  );
};

export default HowToPlay;
