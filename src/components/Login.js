import React, { useRef, useState, useEffect } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import Alert from "@mui/material/Alert";
import { useNavigate } from "react-router-dom";

import "./LoginRegister.css";

function Login({ setIsLoggedIn, setIsRegister, setUser }) {
  const navigate = useNavigate();
  const [loginAlert, setLoginAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("login"); // 'login' | 'mfa'
  // const [email, setEmail] = useState('');
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [hideForm, setHideForm] = useState(false);
  const [mfaCode, setMfaCode] = useState("");
  const [email, setEmail] = useState("");
  const [timer, setTimer] = useState(60);
  // const [resendDisabled, setResendDisabled] = useState(true);
  const [verifyAlert, setVerifyAlert] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL

  // Google Login Handler
  const handleGoogleLoginSuccess = async (credentialResponse) => {
    const decoded = jwtDecode(credentialResponse.credential);
    setHideForm(true);
    setIsLoggedIn(true);
    setUser({ username: decoded.name, role: "normal" }); // Set full user object
    setLoginAlert({ type: "success", message: `Welcome, ${decoded.name}!` });
    setTimeout(() => navigate("/"), 2000);
  };

  const handleGoogleLoginError = () => {
    setLoginAlert({ type: "error", message: "Google login failed." });
  };

  useEffect(() => {
    if (step === "verify" && timer > 0) {
      const countdown = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(countdown); // Clear interval on component unmount
    } else if (timer === 0) {
      handleResendCode(); // Automatically resend code after 1 minute
      setTimer(60); // Reset the timer
    }
  }, [step, timer]);

  // Send Credentials to Backend for Validation and Request MFA Code
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const inputUsername = e.target.username.value;
    const inputPassword = e.target.password.value;

    setUsername(inputUsername);
    setPassword(inputPassword);
    setLoginAlert(null);
    setLoading(true);
    setHideForm(false); // No Hide the registration form
    setVerifyAlert(null); // Clear existing alert

    try {
      const response = await fetch(`${API_BASE_URL}/api/mfa/send-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: inputUsername,
          password: inputPassword,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        console.log("API Response:", result); // Debug the response
        setUser({ username, role: result.role }); // Use the role from response

        console.log(`Logged in as: ${result.role}`); // Debug the role

        // Fetch and save userId
        const userIdResponse = await fetch(
          `${API_BASE_URL}/api/users/get-user-id?username=${encodeURIComponent(inputUsername)}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (userIdResponse.ok) {
          const userIdData = await userIdResponse.json();
          localStorage.setItem("user_id", userIdData.userId); // Save userId to local storage
          console.log("User ID:", userIdData.userId);
        } else {
          console.error("Failed to fetch user ID:", userIdResponse.status);
        }

        if (result.role === "admin") {
          // Admin bypasses MFA verification
          setLoginAlert({
            type: "success",
            message: "Login Successful as Admin!",
          });

          setHideForm(true);
          setIsLoggedIn(true); // Directly mark as logged in

          // Delay the navigation to allow alert to be visible
          setTimeout(() => {
            setVerifyAlert(null); // Clear alert
            navigate("/"); // Redirect to home page
          }, 1000); // 1-second delay for the alert visibility
        } else {
          // Regular users proceed with MFA verification
          setVerifyAlert({
            type: "success",
            message: "MFA code sent to your email.",
          });
          setTimeout(() => {
            setVerifyAlert(null);
          }, 5000);
          setStep("verify"); // Move to code verification step
        }
      } else {
        // Handle invalid credentials
        setVerifyAlert({
          type: "error",
          message: result.message || "Invalid credentials.",
        });
        setTimeout(() => {
          setVerifyAlert(null);
          setIsLoggedIn(false);
          setHideForm(false);
        }, 3000);
      }
    } catch (error) {
      // Handle server connection error
      setVerifyAlert({
        type: "error",
        message: "Error connecting to the server. Please try again.",
      });
      setTimeout(() => {
        setVerifyAlert(null);
        setIsLoggedIn(false);
        setHideForm(false);
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  // Verify MFA Code
  const handleVerifyCode = async () => {
    setLoading(true);
    setVerifyAlert(null); // Clear existing alert
    setLoginAlert(null);
    setHideForm(false);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/mfa/verify-code`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, code: mfaCode }),
        }
      );

      const result = await response.json();
      if (response.ok) {
        setVerifyAlert({
          type: "success",
          message: result.message || "MFA verification successful.",
        });

        const userId = localStorage.getItem("user_id"); // Retrieve userId from local storage
        await updateUserLoggedInStatus(userId, true); // Mark user as logged in in the database

        // Hide the form and show loading spinner in the middle
        setTimeout(() => {
          setHideForm(true); // Hide the form
          setLoading(true); // Keep showing the loading spinner in the middle

          // Final navigation after delay
          setTimeout(() => {
            setIsLoggedIn(true); // Update login state
            setUser({ username: username, role: result.role }); // Set full user object
            navigate("/"); // Redirect to home page
          }, 3000); // 3-second delay for loading spinner
        }, 1000); // Short delay to hide form
      } else {
        setVerifyAlert({
          type: "error",
          message: result.message || "Invalid MFA code.",
        });
        setTimeout(() => {
          setVerifyAlert(null);
          setLoading(false);
        }, 2000); // 2-second delay to delete the alert
      }
    } catch (error) {
      setVerifyAlert({
        type: "error",
        message: "Error verifying the MFA code. Please try again.",
      });
      setTimeout(() => {
        setVerifyAlert(null);
        setLoading(false);
      }, 2000); // 2-second delay to clear alert
    }
  };

  // Resend Code Function
  const handleResendCode = async () => {
    setLoginAlert(null); // Clear existing alert
    setVerifyAlert(null); // Clear existing alert
    try {
      const response = await fetch(`${API_BASE_URL}/api/mfa/send-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        setTimeout(() => {
          setVerifyAlert(null);
        }, 2000);
      } else {
        const result = await response.json();
        setVerifyAlert({
          type: "error",
          message: result.message || "Failed to resend the code.",
        });
        setTimeout(() => {
          setVerifyAlert(null);
        }, 2000);
      }
    } catch (error) {
      setVerifyAlert({
        type: "error",
        message: "Error resending the code. Please try again.",
      });
      setTimeout(() => {
        setVerifyAlert(null);
      }, 2000);
    }
  };

  //Send link via user email
  const handleSendLink = async (e) => {
    e.preventDefault();
    const inputEmail = email;
    setEmail(inputEmail);
    setLoginAlert(null);
    setLoading(true);
    setHideForm(false); // No Hide the registration form
    setVerifyAlert(null); // Clear existing alert
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/users/send-verification-by-email/${email}`,
        {
          method: "POST",
        }
      );
      //const result = await response.json();
      if (response.ok) {
        // Admin bypasses MFA verification
        setLoginAlert({
          type: "success",
          message: "MFA link sent successfully.",
        });
        setTimeout(() => {
          setVerifyAlert(null); // Clear alert
          setLoginAlert(null);
          navigate("/"); // Redirect to home page
        }, 3000);
      } else {
        setEmail("");
        setLoginAlert({
          type: "error",
          message: `Error sending the link to ${inputEmail}. Please try again.`,
        });
        setTimeout(() => {
          setLoginAlert(null);
          setStep("Link");
          setLoading(false);
        }, 2000);
      }
    } catch (error) {
      setVerifyAlert({
        type: "error",
        message: `Error sending the link to ${inputEmail}. Please try again.`,
      });
      setTimeout(() => {
        setVerifyAlert(null);
      }, 2000);
    }
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
    <div className="login-register-page">
      {/* Show alert for success or error */}
      {loginAlert && (
        <div
          className={`alert-container ${
            loginAlert.type === "success" ? "alert-center" : ""
          }`}
        >
          <Alert severity={loginAlert.type}>{loginAlert.message}</Alert>
        </div>
      )}

      {verifyAlert && (
        <div
          className={`verify-alert-container verify-${
            verifyAlert.type === "success" ? "alert-center" : ""
          }`}
        >
          <Alert severity={verifyAlert.type} className="custom-verify-alert">
            {verifyAlert.message}
          </Alert>
        </div>
      )}

      {/* Show loading spinner for Login */}
      {loading && (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Processing...</p>
        </div>
      )}

      {/* Login Form */}
      {step === "login" && !loading && !hideForm && (
        <div className="form-container">
          <form className="form" onSubmit={handleLoginSubmit}>
            <h2>Login</h2>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit">Login</button>
            <p>
              No account?{" "}
              <span className="switch-form" onClick={() => setIsRegister(true)}>
                Register
              </span>
              <br></br>
              <span className="switch-form" onClick={() => setStep("Link")}>
                Forgot Password?
              </span>
            </p>
          </form>
          <div className="google-login">
            <h3>Or Login with Google</h3>
            <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={handleGoogleLoginError}
            />
          </div>
        </div>
      )}

      {/* Verify Code Step */}
      {step === "verify" && !loading && (
        <div className="form-container">
          <h2 className="verify-title">Verify Your Code</h2>
          <p className="verify-instructions">
            A 6-digit verification code has been sent to your email. Please
            enter it below.
          </p>

          {/* Input for MFA Code */}
          <input
            type="text"
            placeholder="Enter 6-digit code"
            value={mfaCode}
            onChange={(e) => setMfaCode(e.target.value)}
            maxLength="6"
            className="verify-input"
            required
          />

          {/* Verify Button */}
          <button
            onClick={handleVerifyCode}
            className="verify-button"
            disabled={!mfaCode || mfaCode.length !== 6}
          >
            Verify Code
          </button>

          {/* Back to Login Button */}
          <button
            onClick={() => setStep("login")}
            className="back-to-login-button"
          >
            Go Back to Login
          </button>

          {/* Timer for Auto Resend */}
          <p className="timer-text">
            A new code will be sent automatically in {timer}s.
          </p>
        </div>
      )}

      {/* Send link to email step */}
      {step === "Link" && !loading && (
        <div className="form-container">
          <div className="form">
            <h2 className="verify-title">Forgot Password</h2>
            <p className="verify-instructions">
              Please enter your email and change your password with the link.
            </p>

            {/* Input Email */}
            <input
              type="text"
              placeholder="Enter Email"
              value={email}
              autoFocus
              onChange={(e) => setEmail(e.target.value)}
              maxLength=""
              className="input"
              required
            />

            {/* send link Button */}
            <button onClick={handleSendLink} className="button">
              Send Link
            </button>

            {/* Back to Login Button */}
            <button
              onClick={() => setStep("login")}
              className="back-to-login-button"
            >
              Go Back to Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
