import { Flex, Title } from "@mantine/core";
import { Link } from "react-router-dom";

export function Home() {
  return (
    <>
      <Title>This is an example site</Title>
      <Flex direction="column" gap={"md"}>
        <Link to="/post1">post1</Link>
        <Link to="/post2">post2</Link>
        <Link to="/post3">post3</Link>
      </Flex>
    </>
  );
}
