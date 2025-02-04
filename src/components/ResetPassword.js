import React, { useState, useEffect } from "react";
import Alert from "@mui/material/Alert";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "./LoginRegister.css";

function ResetPassword({ setIsRegister }) {
  const [registerAlert, setRegisterAlert] = useState(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [hideForm, setHideForm] = useState(false);
  const [email, setEmail] = useState("");

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL

  const useQuery = () => {
    return new URLSearchParams(useLocation().search);
  };

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const emailParam = query.get("email");
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }
  }, []);

  const handleResetPassword = async (e) => {
    e.preventDefault();

    const password1 = e.target.password1.value;
    const password2 = e.target.password2.value;

    // Regular expression to check if the password contains at least one uppercase letter, one special character, and is at least 8 characters long
    const passwordRegex = /^(?=.*[A-Z])(?=.*[\W_]).{8,}$/;

    setRegisterAlert(null);
    setLoading(true);
    setHideForm(true); // Hide the registration form

    try {
      if (password1 !== password2) {
        setTimeout(() => {
          setLoading(false); // Hide spinner
          setRegisterAlert({
            type: "error",
            message: "Error: Password does not match.",
          });
          setTimeout(() => {
            setRegisterAlert(null); // Clear alert after delay
            setHideForm(false); // Reset form visibility
            setIsRegister(false); // Switch back to the login form
          }, 2000); // Show alert for 2 seconds
        }, 1000);
      }

      if (!passwordRegex.test(password1)) {
        setTimeout(() => {
          setLoading(false); // Hide spinner
          setHideForm(false); // Reset form visibility
          setRegisterAlert({
            type: "error",
            message:
              "Error: Password must be at least 8 characters long and contain at least one uppercase letter and one special character.",
          });
          setTimeout(() => {
            setRegisterAlert(null); // Clear alert after delay
            setHideForm(false); // Reset form visibility
          }, 3000); // Show alert for 2 seconds
        }, 1000);
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/users/Reset-Password`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            Email: email,
            NewPassword: password1,
          }),
        }
      );

      if (response.ok) {
        setTimeout(() => {
          setLoading(false); // Hide spinner
          setRegisterAlert({
            type: "success",
            message: "Your Password has been reset.",
          });
          setTimeout(() => {
            setRegisterAlert(null); // Clear alert after delay
            navigate("/login");
          }, 2000); // Show alert for 2 seconds
        }, 1000);
      } else {
        const errorData = await response.text();
        setLoading(false); // Hide spinner
        setHideForm(false); // Reset form visibility
        setRegisterAlert({ type: "error", message: `Error: ${errorData}` });
        setTimeout(() => {
          setRegisterAlert(null); // Clear alert after delay
        }, 3000); // Show alert for 2 seconds
      }
    } catch (error) {
      setLoading(false); // Hide spinner
      setHideForm(false); // Reset form visibility
      setRegisterAlert({
        type: "error",
        message: "Error connecting to the server.",
      });
    }
  };

  return (
    <div className="login-register-page">
      {registerAlert && (
        <div
          className={`alert-container ${
            registerAlert.type === "success" ? "alert-center" : ""
          }`}
        >
          <Alert severity={registerAlert.type}>{registerAlert.message}</Alert>
        </div>
      )}

      {loading && (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Creating user...</p>
        </div>
      )}

      {/* Register Form */}
      {!loading && !hideForm && (
        <div className="form-container">
          <form className="form" onSubmit={handleResetPassword}>
            <h2>Reset Password</h2>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={email}
              disabled
            />
            <input
              type="password"
              name="password1"
              placeholder="New Password"
              required
            />
            <input
              type="password"
              name="password2"
              placeholder="New Password"
              required
            />
            <button type="submit">Reset Password</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default ResetPassword;
