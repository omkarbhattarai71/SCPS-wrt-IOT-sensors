import React from 'react';
import Login from '../components/Login';

function LoginPage({ setToken, setUserType }) {
  return <Login setToken={setToken} setUserType={setUserType}/>;
}

export default LoginPage;
