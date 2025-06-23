import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import React from "react";
import { LearningStatsProvider } from "./context/learningStatsContext";
import '@fortawesome/fontawesome-free/css/all.min.css';
import "./App.css";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/userProfile"; 
import Translator from "./pages/Translator";
import Learn from "./pages/Learn";
import Home from "./pages/Home";
import Help from "./pages/Help";
import Layout from "./pages/Layout"; 
console.log('Layout:', Layout);


function App() {
  const isLoggedIn = true;

  return (
    <LearningStatsProvider>
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/landing" element={<Landing />} />
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
        <Route
          path="/help"
          element={
            isLoggedIn ? (
              <Layout isLoggedIn={isLoggedIn}>
                <Help />
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