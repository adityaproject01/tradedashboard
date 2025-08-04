import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [logs, setLogs] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchLogs = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/logs");
      const data = response.data;

      if (data.length !== logs.length) {
        setLogs(data);
        setLastUpdated(new Date().toLocaleTimeString());
      }
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    }
  };

  useEffect(() => {
    fetchLogs(); // initial fetch
    const interval = setInterval(fetchLogs, 5000); // refresh every 5 sec
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container">
      <h1>📈 AI Trading Live Logs</h1>
      <p className="updated">Last updated: {lastUpdated || "Loading..."}</p>
      <div className="log-box">
        {logs.length === 0 ? (
          <p>🔄 Waiting for trade logs...</p>
        ) : (
          logs.map((log, index) => (
            <div key={index} className={`log-entry ${log.Action.toLowerCase()}`}>
              <p>
                <strong>{log.Time}</strong> — <span className="action">{log.Action}</span> ₹{log.Price} Qty: {log.Qty}
              </p>
              <p>
                P/L: ₹{log["P/L"]} | Unrealized: ₹{log.Unrealized} | Net Worth: ₹{log["Net Worth"]}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;