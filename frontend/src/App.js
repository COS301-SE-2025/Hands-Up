// src/App.js
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Link } from "react-router-dom";
import React from "react";
import '@fortawesome/fontawesome-free/css/all.min.css';
import "./App.css";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/userProfile"; // Renamed from Profile to userProfile as per NAV_PATHS
import Translator from "./pages/Translator";
import Learn from "./pages/Learn";
import Home from "./pages/Home";
import Layout from "./pages/Layout"; // Path correct now
console.log('Layout:', Layout);


function App() {
  const isLoggedIn = true; // Still hardcoded, remember to replace with actual auth logic

  return (
    <Router>
      <Routes>
        {/* Public pages without layout */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected pages wrapped in layout */}
        {/*
          Each Route now implicitly passes its content (Profile, Translator, etc.)
          as 'children' to the Layout component.
          The Layout component now uses useLocation to figure out the active page.
        */}
        <Route
          path="/userProfile"
          element={
            isLoggedIn ? (
              <Layout isLoggedIn={isLoggedIn}>
                <Profile />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/translator"
          element={
            isLoggedIn ? (
              <Layout isLoggedIn={isLoggedIn}>
                <Translator />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/learn"
          element={
            isLoggedIn ? (
              <Layout isLoggedIn={isLoggedIn}>
                <Learn />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/home"
          element={
            isLoggedIn ? (
              <Layout isLoggedIn={isLoggedIn}>
                <Home />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Redirect any unknown path to login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;