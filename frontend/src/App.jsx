// Some code in this file was generated using AI

import { useState, useEffect, useRef } from "react";
import { drawGraph } from "./drawGraph";
import "./App.css";

function App() {
  const [network, setNetwork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const svgRef = useRef(null);

  useEffect(() => {
    console.log(
      "Fetching sending GET request to http://127.0.0.1:5001/api/network",
    );
    fetch("http://127.0.0.1:5001/api/network")
      .then((res) => {
        if (!res.ok) {
          return res.json().then((errData) => {
            throw new Error(errData.error || `HTTP error ${res.status}`);
          });
        }
        return res.json();
      })
      .then((data) => {
        console.log("Fetched network data:", data);
        setNetwork(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch failed:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!network || !svgRef.current) return;

    const cleanup = drawGraph(svgRef.current, network, 500, 500);

    return cleanup;
  }, [network]);

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      {/* Task 6.5: Title format with FSU branding */}
      <p>Citation Network Visualization in FSU (mrb22p, Max Boyington)</p>
      {loading && <p>Connecting to backend...</p>}

      {error && (
        <div>
          <strong>Error:</strong> {error}
        </div>
      )}

      {network && (
        <div>
          <svg ref={svgRef}></svg>
        </div>
      )}
    </main>
  );
}

export default App;
