import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Link } from "react-router-dom";
import React from "react";
import '@fortawesome/fontawesome-free/css/all.min.css';
import "./App.css";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/userProfile";
import Recognize from "./pages/Recognizer";
import Learn from "./pages/Learn";
import Home from "./pages/Home";
import Layout from "./pages/Layout";
console.log('Layout:', Layout);


function App() {
  const isLoggedIn = true; 

  return (
    <Router>
      <Routes>
        {/* Public pages without layout */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected pages wrapped in layout */}
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
          path="/recognizer"
          element={
            isLoggedIn ? (
              <Layout isLoggedIn={isLoggedIn}>
                <Recognize />
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
