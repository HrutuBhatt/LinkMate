import { useForm } from './form_hook';
import './SignupPage.css';
import axios from 'axios';
import React, {useState, useCallback, useContext} from 'react';
import { AuthContext } from '../../context/AuthContext';
// import { Link } from 'react-router-dom';
const SignupPage = () => {
  const [formState, inputHandler] = useForm(
    {
      username: { value: '', isValid: false },
      email: { value: '', isValid: false },
      password: { value: '', isValid: false },
    },
    false
  );

  const auth = useContext(AuthContext);  // Access AuthContext
  const [error, setError] = useState(null);

  const signupSubmitHandler = async (event) => {
    event.preventDefault();
    if (!formState.isValid) {
      console.log('Invalid form submission');
      return;
    }
    // console.log('Signing up', formState.inputs);
    // Send form data to your API
    try {
      const response = await axios.post('http://localhost:5000/api/users/signup', {
        username: formState.inputs.username.value,
        email: formState.inputs.email.value,
        password: formState.inputs.password.value,
      });

      const { token, userId } = response.data;

      auth.login(token);  // Store the token in the AuthContext
      console.log('Signup successful:', response.data);
      // Redirect to another page if necessary
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
      console.log('Signup error:', err);
    }
  };

  return (
    <div className="auth-container">
      <h2><u>SignUp</u></h2>
      <form onSubmit={signupSubmitHandler}>
        <input 
          type="text" 
          id="username"
          placeholder="Username" 
          value={formState.inputs.username.value} 
          onChange={(e) => inputHandler('username', e.target.value, e.target.value.trim().length > 0)} 
        />
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
        <br/><br/>
        <button type="submit" disabled={!formState.isValid}>Signup</button>
        {error && <p className="error-text">{error}</p>}
      </form>
    </div>
  );
};

export default SignupPage;
