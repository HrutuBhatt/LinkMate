import React, { useState, useEffect, useCallback } from 'react';

// Create the AuthContext with initial values
export const AuthContext = React.createContext({
  isLoggedIn: false,
  token: null,
  userId: null,  // Storing userId
  login: () => {},
  logout: () => {},
});

export const AuthProvider = (props) => {
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);

  // login function, stores both token and userId
  const login = useCallback((token, userId) => {
    setToken(token);
    setUserId(userId);
    localStorage.setItem('userToken', token);  // Store token in local storage
    localStorage.setItem('userId', userId);    // Store userId in local storage
  }, []);

  // logout function, clears token and userId
  const logout = useCallback(() => {
    setToken(null);
    setUserId(null);
    // isLoggedIn = false;
    localStorage.removeItem('userToken');
    localStorage.removeItem('userId');
  }, []);

  // On initial load, check if there's an existing token and userId
  useEffect(() => {
    const storedToken = localStorage.getItem('userToken');
    const storedUserId = localStorage.getItem('userId');
    if (storedToken && storedUserId) {
      login(storedToken, storedUserId);  // Automatically log in if token and userId exist
    }
  }, [login]);

  // Context value that will be provided to consuming components
  const contextValue = {
    isLoggedIn: !!token,   // !!token converts token to a boolean
    token: token,
    userId: userId,        // Pass the userId as well
    login: login,
    logout: logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {props.children}
    </AuthContext.Provider>
  );
};
