import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css"; // make sure this is imported at the top
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import useSound from "use-sound";
import pingSfx from "./ping.mp3";

const COLORS = ["#00e3e3", "#00ff88", "#ff006e", "#ffe600", "#8c52ff"];

function App() {
  const [logs, setLogs] = useState([]);
  const [lastTrade, setLastTrade] = useState(null);
  const [play] = useSound(pingSfx);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get(
          "https://tradeback-fc3132a1cbf2.herokuapp.com/api/logs"
        );
        const newLogs = res.data;
        setLogs((prev) => {
          if (prev.length !== newLogs.length) {
            const latest = newLogs[newLogs.length - 1];
            if (latest.Action === "BUY" || latest.Action === "SELL") {
              setLastTrade(latest);
              play();
            }
          }
          return newLogs;
        });
      } catch (e) {
        console.error("Failed to fetch logs", e);
      }
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 3000);
    return () => clearInterval(interval);
  }, [play]);

  const pieData = logs.reduce((acc, log) => {
    acc[log.Action] = (acc[log.Action] || 0) + 1;
    return acc;
  }, {});
  const pieChartData = Object.entries(pieData).map(([name, value]) => ({
    name,
    value,
  }));
  const barChartData = logs.map((log, i) => ({
    name: `${i + 1}`,
    PnL: parseFloat(log["P/L"]) || 0,
  }));

  return (
    <>
      <div className="relative min-h-screen text-white font-mono overflow-hidden background-hud">
        <div className="relative z-10 p-6">
          <motion.h1
            className="text-center text-4xl font-bold text-yellow-400 mb-8 border-b border-yellow-500 pb-3"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            🤖 Little Boy
          </motion.h1>

          {lastTrade && (
            <motion.div
              className="bg-yellow-900/60 backdrop-blur-md rounded-lg mb-6 p-4 shadow-xl border border-yellow-400/20"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <strong>Last Trade:</strong> {lastTrade.Action} @ ₹
              {lastTrade.Price} | Qty: {lastTrade.Qty} | Net Worth: ₹
              {lastTrade["Net Worth"]}
            </motion.div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {/* Trade Logs Table */}
            <div className="bg-black/60 backdrop-blur-md rounded-2xl border border-yellow-500/20 shadow-xl glow-border p-4 max-h-[400px] overflow-y-auto logs-scrollbar">
              <h2 className="text-xl font-bold tracking-wide text-yellow-300 border-b border-yellow-500 pb-2 mb-3 uppercase">
                📋 Trade Logs
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-yellow-100 border-collapse">
                  <thead className="text-xs uppercase bg-yellow-900 text-yellow-300">
                    <tr>
                      <th className="px-4 py-3">Time</th>
                      <th className="px-4 py-3">Action</th>
                      <th className="px-4 py-3">Price</th>
                      <th className="px-4 py-3">Qty</th>
                      <th className="px-4 py-3">P/L</th>
                      <th className="px-4 py-3">Net</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {logs.map((log, i) => (
                      <tr
                        key={i}
                        className={`transition-all duration-200 hover:bg-yellow-800/10 ${
                          log.Action === "BUY"
                            ? "text-green-400"
                            : log.Action === "SELL"
                            ? "text-red-400"
                            : "text-yellow-100"
                        }`}
                      >
                        <td className="px-4 py-2">{log.Time}</td>
                        <td className="px-4 py-2 font-semibold">
                          {log.Action}
                        </td>
                        <td className="px-4 py-2">₹{log.Price}</td>
                        <td className="px-4 py-2">{log.Qty}</td>
                        <td className="px-4 py-2">₹{log["P/L"]}</td>
                        <td className="px-4 py-2">₹{log["Net Worth"]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Charts */}
            <div className="grid gap-6">
              {/* Pie Chart */}
              <div className="bg-black/60 backdrop-blur-md rounded-xl p-4 shadow-xl border border-yellow-500/20 glow-border">
                <h2 className="text-lg font-semibold text-yellow-300 mb-3">
                  📊 Action Overview
                </h2>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={80}
                    >
                      {pieChartData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Bar Chart */}
              <div className="bg-black/60 backdrop-blur-md rounded-xl p-4 shadow-xl border border-yellow-500/20 glow-border">
                <h2 className="text-lg font-semibold text-yellow-300 mb-3">
                  📉 P/L Per Trade
                </h2>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={barChartData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="PnL" fill="#ffe600" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
