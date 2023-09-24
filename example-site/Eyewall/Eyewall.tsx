import { Box, Center, Flex, Space } from "@mantine/core";
import { useEffect, useRef, useState } from "react";
import { CredentialType, IDKitWidget } from "@worldcoin/idkit";
import "../src/App.css";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { urlToAddressBytes } from "../src/stringToAddress";

const glowHeight = 200;
const glowWidth = 200;
const glowBorderRadius = 100;
const sponsorAddress = "http://jalchemy-production.up.railway.app";

const Backdrop = styled.div<{ isvisible: boolean }>`
  position: fixed;
  z-index: 2;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);

  ${(props) => !props.isvisible && "display: none;"}
`;

const HoverableWrapper = styled.div<{
  $borderradius: number;
}>`
  z-index: 3;
  display: inline-block;
  position: relative;
  ${(props) =>
    props.$borderradius && `border-radius: ${props.$borderradius}px`};
  transition-duration: 300ms;
  transition-property: transform, box-shadow;
  transition-timing-function: ease-out;
  overflow: hidden;

  box-shadow: 0px 4px 16px -4px rgba(0, 0, 0, 0.25);

  img {
    display: block;
  }

  &:hover {
    transition-duration: 150ms;
    box-shadow: 0px 32px 64px -16px rgba(0, 0, 0, 0.25);
  }
`;

const Glow = styled.div`
  pointer-events: none;
  position: absolute;
  border-radius: ${glowBorderRadius}px;
  height: ${glowHeight}px;
  width: ${glowWidth}px;
  background: radial-gradient(
    circle at center,
    rgba(255, 255, 255, 0.2) 0%,
    rgba(255, 255, 255, 0.15) 20%,
    rgba(255, 255, 255, 0.1) 40%,
    rgba(255, 255, 255, 0.02) 60%,
    rgba(255, 255, 255, 0.0001) 80%,
    transparent 100%
  );

  pointer-events: none;
`;

const HoverableContainer = styled.div<{ isvisible: boolean }>`
  position: fixed;
  z-index: 3;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  ${(props) => !props.isvisible && "display: none;"}
`;

export function Eyewall() {
  const [open, setOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [boxPosition, setBoxPosition] = useState({ x: 0, y: 0 });
  const [boxVisible, setBoxVisible] = useState(false);

  useEffect(() => {
    setOpen(true);
  }, []);

  useEffect(() => {
    const card = cardRef.current!;
    if (!card) return;
    let bounds: DOMRect;

    function rotateToMouse(e: MouseEvent) {
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      const boxX = e.clientX - bounds.x;
      const boxY = e.clientY - bounds.y;

      const boxYAdjusted = boxY - glowHeight / 2;
      const boxXAdjusted = boxX - glowWidth / 2;

      const leftX = mouseX - bounds.x;
      const topY = mouseY - bounds.y;

      const center = {
        x: leftX - bounds.width / 2,
        y: topY - bounds.height / 2,
      };

      setBoxPosition({ x: boxXAdjusted, y: boxYAdjusted });

      const maxRotationLeftRight = 15;
      const maxRotationUpDown = 12;
      const rotationUpDown = (center.y / bounds.height) * maxRotationUpDown;
      const rotationLeftRight =
        (center.x / bounds.width) * maxRotationLeftRight;

      card.style.transform = `perspective(1000px) rotateX(${-rotationUpDown}deg) rotateY(${rotationLeftRight}deg)`;
    }

    const handleMouseEnter = () => {
      setBoxVisible(true);
      bounds = card.getBoundingClientRect();
      document.addEventListener("mousemove", rotateToMouse);
    };

    const handleMouseLeave = () => {
      setBoxVisible(false);
      document.removeEventListener("mousemove", rotateToMouse);
      card.style.transform = "";
    };

    // Event listeners
    card.addEventListener("mouseenter", handleMouseEnter);
    card.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      card.removeEventListener("mouseenter", handleMouseEnter);
      card.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  const handleSuccess = async (data: any) => {
    await fetch(`${sponsorAddress}/post`, {
      method: "POST",
      body: JSON.stringify(data)
    })
    console.log("data", data);
    setOpen(false);
  };
  const handleVerify = (data: any) => {
    console.log("verify");
  };
  const signal = urlToAddressBytes(window.location.href);
  return (
    <>
      <Backdrop isvisible={open} />
      <HoverableContainer isvisible={open}>
        <HoverableWrapper ref={cardRef} $borderradius={10}>
          <Box
            style={{
              cursor: "default",
              background: "white",
              padding: "12px 24px",
              margin: "auto auto",
            }}
          >
            <Flex direction={"column"} justify={"center"}>
              <Center>
                <p className="title">
                  You need to verify your identity to view.
                </p>
              </Center>
              <p>This costs 1 view.</p>
              <IDKitWidget
                app_id="app_staging_9b5d49b869afa5618a88c00937987526" // obtained from the Developer Portal
                action="open" // this is your action name from the Developer Portal
                onSuccess={(data: any) => handleSuccess(data)} // callback when the modal is closed
                signal={signal}
                handleVerify={(data: any) => handleVerify(data)} // optional callback when the proof is received
                credential_types={["orb"] as CredentialType[]} // optional, defaults to ['orb']
                enableTelemetry // optional, defaulsts to false
              >
                {({ open }) => (
                  <button onClick={open}>Verify with World ID and view</button>
                )}
              </IDKitWidget>
              <Space h="md" />
              <Center>
                <Link to="/">Home</Link>
              </Center>
            </Flex>
          </Box>
          {boxVisible && (
            <Glow
              style={{ top: `${boxPosition.y}px`, left: `${boxPosition.x}px` }}
            />
          )}
        </HoverableWrapper>
      </HoverableContainer>
    </>
  );
}
