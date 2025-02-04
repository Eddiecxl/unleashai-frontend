import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';

function Auth({ setIsLoggedIn, setUserName }) {
  const [isRegister, setIsRegister] = useState(false); // Toggle state

  return (
    <div className="auth-container">
      {isRegister ? (
        <Register setIsRegister={setIsRegister} />
      ) : (
        <Login setIsLoggedIn={setIsLoggedIn} setUserName={setUserName} setIsRegister={setIsRegister} />
      )}
    </div>
  );
}

export default Auth;
