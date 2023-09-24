import React from "react";
import { Box, Container } from "@mantine/core";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Box>
      <Container mt="md">{children}</Container>
    </Box>
  );
}
