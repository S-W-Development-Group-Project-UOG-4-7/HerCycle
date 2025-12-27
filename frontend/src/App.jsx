// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Contact from "./pages/Contact.jsx";
import About from "./pages/About.jsx";
import "./index.css";
import "./App.css";
import FeedbackForm from "./components/FeedbackForm";
import FeedbackDisplay from "./components/FeedbackDisplay";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="/feedback" element={<FeedbackForm />} />
        <Route path="/feedbacks" element={<FeedbackDisplay />} />
      </Routes>
    </Router>
  );
}

