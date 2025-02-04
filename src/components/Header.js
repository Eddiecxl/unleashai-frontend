import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';
import UnleashedLogo from '../assets/dumb.png';

function Header({ isLoggedIn, userName, setIsLoggedIn, setUser }) {
  const [showLogoutPrompt, setShowLogoutPrompt] = useState(false);
  const navigate = useNavigate();

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL


  const handleLogout = async () => {
    setIsLoggedIn(false);
    setUser({ username: "Guest", role: "guest" });
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user");
    setShowLogoutPrompt(false);
    const userId = localStorage.getItem("user_id"); // Retrieve userId from local storage
    await updateUserLoggedInStatus(userId, "false"); // Mark user as logged out in the database
    localStorage.removeItem("user_id");
    navigate("/");
  };

  const handleCancelLogout = () => {
    setShowLogoutPrompt(false);
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const updateUserLoggedInStatus = async (userId, isLoggedIn) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/users/update-login-status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, isLoggedIn }),
        }
      );

      if (!response.ok) {
        console.error("Failed to update login status:", response.status);
      } else {
        console.log("User login status updated successfully");
      }
    } catch (error) {
      console.error("Error updating login status:", error);
    }
  };

  return (
    <>
      <header className="header">
        <div className="header-left">
          <Link to="/" className="logo-link">
            <img src={UnleashedLogo} alt="Logo" className="logo-image" />
            <span className="logo-text"></span>
          </Link>
        </div>
        <nav className="nav">
          <Link to="/" className="nav-link">
            Home
          </Link>
          <Link to="/chatbot" className="nav-link">
            Chatbot
          </Link>
          {/* <Link to="/history" className="nav-link">History</Link> */}
          <Link to="/about" className="nav-link">
            About Us
          </Link>
          {isLoggedIn && userName.role === "admin" && (
            <Link to="/admin" className="nav-link">
              Admin
            </Link>
          )}
        </nav>
        <div className="auth-buttons">
          {!isLoggedIn ? (
            <button className="sign-in" onClick={handleLogin}>
              Sign in
            </button>
          ) : (
            <>
              <span className="user-name">Hi, {userName?.username}</span>
              <button
                className="logout-button"
                onClick={() => setShowLogoutPrompt(true)}
              >
                Logout
              </button>
            </>
          )}
        </div>
      </header>

      {/* Logout Prompt Modal */}
      {showLogoutPrompt && (
        <div className="logout-modal">
          <div className="logout-modal-content">
            <h2>Are you sure you want to log out?</h2>
            <div className="logout-buttons">
              <button className="logout-confirm" onClick={handleLogout}>
                Yes
              </button>
              <button className="logout-cancel" onClick={handleCancelLogout}>
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;
