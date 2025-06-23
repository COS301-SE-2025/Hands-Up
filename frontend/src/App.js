import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import React from "react";
import { LearningStatsProvider } from "./context/learningStatsContext";
import { AuthProvider } from "./context/authContext"; 
import ProtectedRoute from "./components/ProtectedRoute"; 
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
  return (
 
    <Router>
      <AuthProvider> 
        <LearningStatsProvider>
          <Routes>
            <Route path="/" element={<Landing/>} />
            <Route path="/landing" element={<Landing/>} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/reset-password/:token" element={<Login />} />
           <Route
              path="/userProfile"
              element={
                <ProtectedRoute>
                  <Layout> 
                       <Profile />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/translator"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Translator />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/learn"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Learn />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Home />
                  </Layout>
                </ProtectedRoute>
              }
            />
             <Route
              path="/help"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Help/>
                  </Layout>
                </ProtectedRoute>
              }
            />


            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </LearningStatsProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;