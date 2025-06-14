
// src/App.js
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import React from "react";
import { LearningStatsProvider } from "./context/learningStatsContext";
import '@fortawesome/fontawesome-free/css/all.min.css';
import "./App.css";

import Login from "./pages/login";
import Signup from "./pages/signup";
import Profile from "./pages/userProfile"; // Renamed from Profile to userProfile as per NAV_PATHS
import Translator from "./pages/translator";
import Learn from "./pages/learn";
import Home from "./pages/home";
import Layout from "./pages/layout"; 
console.log('Layout:', Layout);


function App() {
  const isLoggedIn = true;

  return (
    <LearningStatsProvider>
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

       
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
    </LearningStatsProvider>
  );
}

export default App;