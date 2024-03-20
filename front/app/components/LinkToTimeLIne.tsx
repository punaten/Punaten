import { Link } from "@remix-run/react";
import { Button, Motion } from "@yamada-ui/react";

const LinkToTimeLine = () => {
    return (
        <Link to="/timeline" style={{ width: "fit-content" }}>
            <Motion
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 1 }}
                whileFocus={{ scale: 1.05 }}
                p="md"
                rounded="md"
                bg="primary"
                color="white"
            >
                <Button mx={"auto"} bg={["cinnamon", "caramel-dark"]}
                    color={["cream-light", "dark"]} fontSize={24} py={"3rem"} width={"25rem"} rounded={"2rem"} textAlign={"center"}>
                    みんなの猫ミームを見る
                </Button>
            </Motion>
        </Link>
    );
}

export default LinkToTimeLine;