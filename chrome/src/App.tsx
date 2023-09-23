import "./App.css";
import { useState } from "react";
import { Home } from "./Home/Home";
import { Login } from "./Login/Login";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <div
      className="content"
      style={{
        width: "300px",
        height: "250px",
      }}
    >
      {isAuthenticated ? (
        <Home />
      ) : (
        <Login onPrimaryButtonClick={setIsAuthenticated} />
      )}
    </div>
  );
}
