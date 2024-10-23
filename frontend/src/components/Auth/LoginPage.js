import React, { useState, useContext } from 'react';
import { useForm } from './form_hook';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';  
import { useNavigate } from 'react-router-dom';
import './SignupPage.css';
import { Link } from 'react-router-dom';

const LoginPage = () => {
  const [formState, inputHandler] = useForm(
    {
      email: { value: '', isValid: false },
      password: { value: '', isValid: false },
    },
    false
  );
  const navigate = useNavigate();
  const auth = useContext(AuthContext);  
  const [error, setError] = useState(null);

  const loginSubmitHandler = async (event) => {
    event.preventDefault();
    if (!formState.isValid) {
      console.log('Invalid form submission');
      return;
    }

    try {
      // Send the login request to the backend
      const response = await axios.post('http://localhost:5000/api/users/login', {
        email: formState.inputs.email.value,
        password: formState.inputs.password.value,
      });

      const { token, userId } = response.data;

    
      auth.login(token, userId); 

      console.log('Login successful:', response.data);
      navigate('/home');
   
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      console.log('Login error:', err);
    }
  };

  return (
    <div className='background'>
    <div className="header">
      <h1>💬LinkMate</h1>
    </div>
    <div className="auth-container">
      <h2><u>Login</u></h2>
      <form onSubmit={loginSubmitHandler}>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <input 
          type="email" 
          id="email"
          placeholder="Email" 
          value={formState.inputs.email.value} 
          onChange={(e) => inputHandler('email', e.target.value, e.target.value.includes('@'))} 
        />
        <input 
          type="password" 
          id="password"
          placeholder="Password" 
          value={formState.inputs.password.value} 
          onChange={(e) => inputHandler('password', e.target.value, e.target.value.length > 5)} 
        />
        <button type="submit" disabled={!formState.isValid}>Login</button>

        <p>Don't have an account?</p>
        <Link to="/signup">
          <span className="icon-name">Signup</span>
        </Link>
        
      </form>
   </div>
   </div>
  );
};

export default LoginPage;
