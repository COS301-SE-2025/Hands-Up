import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { LearningStatsProvider } from "./contexts/learningStatsContext";
import { AuthProvider } from "./contexts/authContext"; 
import { ModelSwitchProvider } from './contexts/modelContext';
import { DexterityProvider } from './contexts/dexterityContext';
import { ProtectedRoute } from "./components/protectedRoute"; 
import '@fortawesome/fontawesome-free/css/all.min.css';
import "./styles/App.css";
import { HelpMenu } from "./pages/help";
import { Login } from "./pages/login";
import { Signup} from "./pages/signup";
import { UserProfile } from "./pages/userProfile"; 
import { Landing } from "./pages/landing";
import { Translator } from "./pages/translator";
import { Learn } from "./pages/learn";
import { SignLearn } from "./pages/signLearn";
import { Home} from "./pages/home";
import { SignQuiz} from "./pages/SignQuiz";
import { Layout } from "./pages/layout"; 
import { Game } from "./pages/game"; 
import GameGuide from "./components/game/gameGuide";
import ErrorBoundary from "./components/errorBoundary";
import ErrorFallback from "./components/errorFallback";
import { useGLTF } from "@react-three/drei";

function App() {
  useGLTF.preload('/models/angieWaving.glb');
  return (
 
    <Router>
      <AuthProvider> 
        <LearningStatsProvider>
          <ModelSwitchProvider>
            <DexterityProvider>
              <Routes>
                <Route path="/" element={<Landing/>} />
                <Route path="/landing" element={<Landing/>} />
                <Route path="/login" element={
                  <ErrorBoundary fallback={<ErrorFallback errorName="Login" />}>
                    <Login />
                  </ErrorBoundary>
              } />
              <Route path="/phrase/:letter" element={
                <ProtectedRoute>
                  <ErrorBoundary fallback={<ErrorFallback errorName="SignLearn" />}>
                    <SignLearn />
                  </ErrorBoundary>
                </ProtectedRoute>
              } />

              <Route path="/quiz/:category" element={
                <ProtectedRoute>
                  <ErrorBoundary fallback={<ErrorFallback errorName="Quiz" />}>
                    <SignQuiz />
                  </ErrorBoundary>
                </ProtectedRoute>
              } />
              
              <Route path="/quiz" element={<Navigate to="/quiz/alphabets" replace />} />
              <Route path="/numbers-quiz" element={<Navigate to="/quiz/numbers" replace />} />
              <Route path="/colours-quiz" element={<Navigate to="/quiz/colours" replace />} />
              <Route path="/introduce-quiz" element={<Navigate to="/quiz/introduce" replace />} />
              <Route path="/family-quiz" element={<Navigate to="/quiz/family" replace />} />
              <Route path="/feelings-quiz" element={<Navigate to="/quiz/feelings" replace />} />
              <Route path="/actions-quiz" element={<Navigate to="/quiz/actions" replace />} />
              <Route path="/questions-quiz" element={<Navigate to="/quiz/questions" replace />} />
              <Route path="/time-quiz" element={<Navigate to="/quiz/time" replace />} />
              <Route path="/food-quiz" element={<Navigate to="/quiz/food" replace />} />
              <Route path="/things-quiz" element={<Navigate to="/quiz/things" replace />} />
              <Route path="/animals-quiz" element={<Navigate to="/quiz/animals" replace />} />
              <Route path="/seasons-quiz" element={<Navigate to="/quiz/seasons" replace />} />
              <Route path="/phrases-quiz" element={<Navigate to="/quiz/phrases" replace />} />

                <Route path="/signup" element={<ErrorBoundary fallback={<ErrorFallback errorName="Signup" />}>
                    <Signup />
                  </ErrorBoundary>
                } />
                <Route path="/reset-password/:token" element={<Login />} />

                <Route path="/sign/:letter" element={

                  <ProtectedRoute>
                    <ErrorBoundary fallback={<ErrorFallback errorName="SignLearn" />}>
                      <SignLearn />
                    </ErrorBoundary>
                  </ProtectedRoute>
                } />

                <Route path="/quiz/:category" element={
                  <ProtectedRoute>
                    <ErrorBoundary fallback={<ErrorFallback errorName="Quiz" />}>
                      <SignQuiz />
                    </ErrorBoundary>
                  </ProtectedRoute>
                } />
                
                <Route path="/quiz" element={<Navigate to="/quiz/alphabets" replace />} />
                <Route path="/numbers-quiz" element={<Navigate to="/quiz/numbers" replace />} />
                <Route path="/colours-quiz" element={<Navigate to="/quiz/colours" replace />} />
                <Route path="/introduce-quiz" element={<Navigate to="/quiz/introduce" replace />} />
                <Route path="/family-quiz" element={<Navigate to="/quiz/family" replace />} />
                <Route path="/feelings-quiz" element={<Navigate to="/quiz/feelings" replace />} />
                <Route path="/actions-quiz" element={<Navigate to="/quiz/actions" replace />} />
                <Route path="/questions-quiz" element={<Navigate to="/quiz/questions" replace />} />
                <Route path="/time-quiz" element={<Navigate to="/quiz/time" replace />} />
                <Route path="/food-quiz" element={<Navigate to="/quiz/food" replace />} />
                <Route path="/things-quiz" element={<Navigate to="/quiz/things" replace />} />
                <Route path="/animals-quiz" element={<Navigate to="/quiz/animals" replace />} />
                <Route path="/seasons-quiz" element={<Navigate to="/quiz/seasons" replace />} />
                
              <Route
                  path="/userProfile"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary fallback={<ErrorFallback errorName="userProfile" />}>
                      <Layout>
                        <UserProfile />
                      </Layout>
                    </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/translator"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary fallback={<ErrorFallback errorName="Translator" />}>
                      <Layout>
                        <Translator />
                      </Layout>
                    </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/learn"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary fallback={<ErrorFallback errorName="Learn" />}>
                      <Layout>
                        <Learn />
                      </Layout>
                    </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/home"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary fallback={<ErrorFallback errorName="Home" />}>
                      <Layout>
                        <Home />
                      </Layout>
                    </ErrorBoundary>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/signup"
                element={<ErrorBoundary fallback={<ErrorFallback errorName="Signup" />}>
                    <Signup />
                  </ErrorBoundary>
                } />
              <Route path="/reset-password/:token" element={<Login />} />
                <Route path="/sign/:letter" element = {<SignLearn />} />
                <Route path="/quiz" element={<SignQuiz />} />
                <Route
                  path="/userProfile"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary fallback={<ErrorFallback errorName="userProfile" />}>
                      <Layout>
                        <UserProfile />
                      </Layout>
                    </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/translator"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary fallback={<ErrorFallback errorName="Translator" />}>
                      <Layout>
                        <Translator />
                      </Layout>
                    </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/learn"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary fallback={<ErrorFallback errorName="Learn" />}>
                      <Layout>
                        <Learn />
                      </Layout>
                    </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/home"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary fallback={<ErrorFallback errorName="Home" />}>
                      <Layout>
                        <Home />
                      </Layout>
                    </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/help"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary fallback={<ErrorFallback errorName="Help" />}>
                      <Layout>
                        <HelpMenu />
                      </Layout>
                    </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/signLearn"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary fallback={<ErrorFallback errorName="Help" />}>
                      <Layout>
                        <SignLearn />
                      </Layout>
                    </ErrorBoundary>

                    </ProtectedRoute>
                  }
                />
                <Route
                path="/game"
                element={
                  <ProtectedRoute>
                    <ErrorBoundary fallback={<ErrorFallback errorName="Translator" />}>
                      <Game />
                  </ErrorBoundary>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/game/guide"
                element={
                  <ProtectedRoute>
                    <ErrorBoundary fallback={<ErrorFallback errorName="Translator" />}>
                      <GameGuide />
                  </ErrorBoundary>
                  </ProtectedRoute>
                }
              />
              {/* <Route
                  path="/game"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary fallback={<ErrorFallback errorName="Help" />}>
                        <Game />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                >
                <Route path="guide" element={<GameGuide />} />
              </Route> */}
                <Route path="*" element={<Navigate to="/login" />} />
              </Routes>
            </DexterityProvider>
          </ModelSwitchProvider>
        </LearningStatsProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;