import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import React from "react";
import { LearningStatsProvider } from "./context/learningStatsContext";
import { AuthProvider } from "./context/authContext"; 
import ProtectedRoute from "./components/ProtectedRoute"; 
import '@fortawesome/fontawesome-free/css/all.min.css';
import "./styles/App.css";
import { Help } from "./pages/help";
import { Login } from "./pages/login";
import { Signup} from "./pages/signup";
import { UserProfile } from "./pages/userProfile"; 
import { Landing } from "./pages/landing";
import { Translator } from "./pages/translator";
import { Learn } from "./pages/learn";
import { SignLearn } from "./pages/signLearn";
import { Home} from "./pages/home";
import { Layout } from "./pages/layout"; 


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
                       <UserProfile />
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
            <Route
              path="/signLearn"
              element={
                <ProtectedRoute>
                  <Layout>
                    <SignLearn />
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