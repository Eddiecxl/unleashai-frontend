import React, { useState } from 'react';
import Alert from '@mui/material/Alert';
import './LoginRegister.css';

function Register({ setIsRegister }) {
  const [registerAlert, setRegisterAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hideForm, setHideForm] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    const username = e.target.username.value;
    const password = e.target.password.value;
    const age = e.target.age.value;
    const email = e.target.email.value;
    const phoneNumber = e.target.phonenumber.value;

    setRegisterAlert(null);
    setLoading(true);
    setHideForm(true); // Hide the registration form

    try {
      const response = await fetch(`${API_BASE_URL}/api/Users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Username: username,
          Password: password,
          Age: parseInt(age),
          Email: email,
          PhoneNumber: phoneNumber,
          Role: 'normal',
        }),
      });

      if (response.ok) {
        setTimeout(() => {
            setLoading(false); // Hide spinner
            setRegisterAlert({ type: "success", message: "Registration Successful! You can now log in." });
            setTimeout(() => {
              setRegisterAlert(null); // Clear alert after delay
              setHideForm(false); // Reset form visibility
              setIsRegister(false); // Switch back to the login form
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
        setRegisterAlert({ type: "error", message: "Error connecting to the server." });
    }
  };

  return (
    <div className="login-register-page">
      {registerAlert && (
        <div className={`alert-container ${registerAlert.type === 'success' ? 'alert-center' : ''}`}>
      <Alert severity={registerAlert.type}>{registerAlert.message}</Alert>
      </div>
    )}

      {loading && <div className="loading-spinner"><div className="spinner"></div><p>Creating user...</p></div>}
        



      {/* Register Form */}
      {!loading && !hideForm && (
        <div className="form-container">
            <form className="form" onSubmit={handleRegisterSubmit}>
            <h2>Register</h2>
            <input type="text" name="username" placeholder="Username" required />
            <input type="password" name="password" placeholder="Password" required />
            <input type="number" name="age" placeholder="Age" required />
            <input type="email" name="email" placeholder="Email" required />
            <input type="text" name="phonenumber" placeholder="Phone Number" required />
            <button type="submit">Register</button>
            <p>
                Already have an account?{' '}
                <span className="switch-form" onClick={() => setIsRegister(false)}>Login</span>
            </p>
            </form>
        </div>
      )}
    </div>
  );
}

export default Register;
