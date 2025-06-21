// src/App.js
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import React from "react";
import { LearningStatsProvider } from "./contexts/learningStatsContext";
import '@fortawesome/fontawesome-free/css/all.min.css';
import "./styles/App.css";
import { Help } from "./pages/help";
import { Login } from "./pages/login";
import { Signup} from "./pages/signup";
import { UserProfile } from "./pages/userProfile"; 
import { Translator } from "./pages/translator";
import { Learn } from "./pages/learn";
import { SignLearn } from "./pages/signLearn";
import { Home} from "./pages/home";
import { Layout } from "./pages/layout"; 


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
                <UserProfile />
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
          path="/sign/:letter"
          element={
            isLoggedIn ? (
              <Layout isLoggedIn={isLoggedIn}>
                <SignLearn/>
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