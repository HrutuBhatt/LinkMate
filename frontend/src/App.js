// import logo from './logo.svg';
import './App.css';
import React, {useState, useContext} from "react";
import {
  BrowserRouter as Router, 
  Route, 
  Routes,
  Navigate,
} from "react-router-dom";
import { AuthContext } from './context/AuthContext';
import LoginPage from './components/Auth/LoginPage';
import SignupPage from './components/Auth/SignupPage';
import HomePage from './components/Home/HomePage';
import Sidebar from './components/sidebar/Sidebar';
import ProfilePage from './components/Home/Profile'
import RequestsPage from './components/Home/Requests/RequestPage';
import CreateGroup from './components/Groups/Group';
import ViewGroups from './components/Groups/ViewGroups';
import GroupMemberList from './components/Groups/GroupMemberList';

const App = () => {
  const { isLoggedIn } = useContext(AuthContext);
  const [isExpanded, setIsExpanded] = useState(false);
  const handleMenuClick = () => {
    setIsExpanded(!isExpanded); // Toggle sidebar width
  };
  let routes;
  if(isLoggedIn){
    routes=(
      <Routes>
        {/* Protected Routes */}
        <Route
          path="/home"
          element={isLoggedIn ? <HomePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/"
          element={ <HomePage />}
        />

        <Route
          path="/profile"
          element={<ProfilePage/>}
        />

        <Route
          path="/requests"
          element={<RequestsPage/>}
        />

        <Route
          path="/creategroup"
          element={<CreateGroup/>}
        />

        <Route
          path="/group"
          element={<ViewGroups/>}
        />

        <Route 
          path="/group/:groupId/members" 
          element={<GroupMemberList />} 
        />
      </Routes>
    );
  }
  else{
    routes = (
      <Routes>
        <Route path="/login" element={!isLoggedIn ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/signup" element={!isLoggedIn ? <SignupPage /> : <Navigate to="/" />} />
      </Routes>
  
    );
  }
  return (
    <Router>
      <div className="app-container" >
      {{isLoggedIn} && <Sidebar isExpanded={isExpanded} handleMenuClick={handleMenuClick} setIsExpanded={setIsExpanded}/>}

      <main >{routes}</main>
      </div>  
    </Router>
  );
};

export default App;
