import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import TranscriptionHistory from "./components/TranscriptionHistory";
import "./App.css";

function App() {
  return (
    <div className="App">
      <Router>
        <nav className="navbar">
          <h1>Speech Recognition App</h1>
          <div className="nav-links">
            <a href="/">Dashboard</a>
            <a href="/history">History</a>
          </div>
        </nav>
        <div className="container">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/history" element={<TranscriptionHistory />} />
          </Routes>
        </div>
      </Router>
    </div>
  );
}

export default App;
