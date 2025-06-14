
// src/App.js
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import React from "react";
import { LearningStatsProvider } from "./context/learningStatsContext";

import { AuthProvider, useAuth } from './context/authContext'; // <--- NEW IMPORT

import '@fortawesome/fontawesome-free/css/all.min.css';
import "./App.css";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/userProfile";
import Translator from "./pages/Translator";
import Learn from "./pages/Learn";
import Home from "./pages/Home";
import Layout from "./pages/Layout"; 
console.log('Layout:', Layout);

function ProtectedRoute({ children }) {
  const { isLoggedIn, loadingAuth } = useAuth();

  if (loadingAuth) {return <div>Loading authentication...</div>; 
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
 return children;
}


function App() {
   return (
    <LearningStatsProvider>
      <Router>
       <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

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

            {/* Redirect any unknown path to login*/}
              <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AuthProvider> 
      </Router>
    </LearningStatsProvider>
  );
}

export default App;