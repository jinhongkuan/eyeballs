import { useState } from "react";
import "./Home.css";

export function Home() {
  const [balance, setBalance] = useState(0);
  const [shares, setShares] = useState(0);

  return (
    <div>
      <h1>Home page</h1>
      <p>Views: {balance}</p>
      <p>Shares: {shares}</p>
      <button>Share</button>
      <button>Get more view</button>
    </div>
  );
}
