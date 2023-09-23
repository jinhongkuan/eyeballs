import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import "./App.css";
import { Text } from "@mantine/core";
import { Home } from "./Home";
import { Layout } from "./Layout";
import { Eyewall } from "../Eyewall/Eyewall";

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/post1" element={<Post title="this is 1 post" />} />
          <Route path="/post2" element={<Post title="this is 2 post" />} />
          <Route path="/post3" element={<Post title="this is 3 post" />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

function Post({ title }: { title: string }) {
  return (
    <>
      <Eyewall />
      <Text>{title}</Text>
      <Link to="/">Home</Link>
    </>
  );
}

export default App;
