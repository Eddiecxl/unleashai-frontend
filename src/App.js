import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Home from './components/Home';
import Chatbot from './components/Chatbot';
import AboutUs from './components/AboutUs';
import History from './components/History';
import Login from './components/Login';
import Register from './components/Register';
import ResetPassword from "./components/ResetPassword";
import Layout from './components/Admin/Layout';
import Admin from './components/Admin/Admin';
import RegisteredUsers from './components/Admin/RegisteredUsers';
import UserReports from './components/Admin/UserReports';
import Conversation from './components/Admin/Conversation';
import './components/App.css';


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState({ username: "Guest", role: "guest" });
  const [isRegister, setIsRegister] = useState(false);


  console.log("API Base URL:", process.env.REACT_APP_API_BASE_URL);


  useEffect(() => {
    const savedLoginState = localStorage.getItem("isLoggedIn");
    const savedUser = localStorage.getItem("user");

    if (savedLoginState === "true" && savedUser) {
      setIsLoggedIn(true);
      setUser(JSON.parse(savedUser));
    }


  }, []);

  useEffect(() => {
    localStorage.setItem("isLoggedIn", isLoggedIn);
    localStorage.setItem("user", JSON.stringify(user));
  }, [isLoggedIn, user]);



  return (
    <Router>
      <Header
        isLoggedIn={isLoggedIn}
        userName={user}
        setIsLoggedIn={setIsLoggedIn}
        setUser={setUser}
      
            />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/chatbot" element={<Chatbot />} />
                <Route path="/about" element={<AboutUs />} />
                <Route
                    path="/login"
                    element={
                        isRegister ? (
                            <Register setIsRegister={setIsRegister} />
                        ) : (
                            <Login
                                setIsLoggedIn={setIsLoggedIn}
                                setUser={setUser}
                                setIsRegister={setIsRegister}
                            />
                        )
                    }
                />

                <Route
                  path="/ResetPassword"
                  element={<ResetPassword setIsRegister={setIsRegister} />}
                />
                <Route path="/history" element={<History />} />
                
                 {/* ✅ Fix: Only Redirect to Home If No Login State Exists */}
                <Route
                path="/admin/*"
                element={
                    isLoggedIn && user.role === "admin" ? <Layout /> : <Navigate to="/" replace />
                }
                >
                <Route index element={<Admin />} />
                <Route path="registeruser" element={<RegisteredUsers />} />
                <Route path="userreports" element={<UserReports />} />
                <Route path="conversation" element={<Conversation />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
