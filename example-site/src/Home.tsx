import React from "react";
import { Flex, Title } from "@mantine/core";
import { Link } from "react-router-dom";

export function Home() {
  return (
    <>
      <Title>This is an example site</Title>
      <Flex direction="column" gap={"md"}>
        <div>
          <Link to="/post1">post1</Link>
        </div>
        <div>
          <Link to="/post2">post2</Link>
        </div>
        <div>
          <Link to="/post3">post3</Link>
        </div>
      </Flex>
    </>
  );
}
