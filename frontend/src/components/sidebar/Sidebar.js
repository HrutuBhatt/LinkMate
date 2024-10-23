// src/components/Sidebar.js
import React, { useRef, useEffect,useContext } from 'react';
import { FaBars, FaComments, FaPhone, FaCircle, FaSignOutAlt , FaBell, FaSearch, FaUser, FaPlus, FaUserCircle, FaUserCog, FaUserFriends} from 'react-icons/fa'; // Icons for chat, calls, status
import { Link } from 'react-router-dom';
import './Sidebar.css';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
const Sidebar = ({ isExpanded, setIsExpanded }) => {
    const sidebarRef = useRef(null);
    const { logout } = useContext(AuthContext);
    const navigate = useNavigate(); // To programmatically navigate
  
    // Close the sidebar when clicking outside of it
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
          setIsExpanded(false); // Only close the sidebar when clicked outside
        }
      };
  
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [setIsExpanded]);
  
    // Toggle sidebar
    const handleMenuClick = () => {
      setIsExpanded(!isExpanded);
    };
  
    // Logout function
    const handleLogout = () => {
        logout();
        navigate('/login');
    };
  
    // const showRequests = ()=>{
    //     navigate('/requests');
    // }
    return (
      <div ref={sidebarRef} className={`sidebar ${isExpanded ? 'expanded' : ''}`}>
        {/* Menu Button */}
        <div className="menu-button" onClick={handleMenuClick}>
          <FaBars className="menu-icon" />
        </div>
  
        {/* Sidebar icons */}
        <div className="sidebar-icons">
          <Link to="/" className="sidebar-item">
            <FaComments className="icon" />
            {isExpanded && <span className="icon-name">Chats</span>}
          </Link>
          <Link to="/" className="sidebar-item">
            <FaPhone className="icon" />
            {isExpanded && <span className="icon-name">Calls</span>}
          </Link>
          <Link to="/creategroup" className="sidebar-item">
            <FaPlus className="icon" />
            {isExpanded && <span className="icon-name">Create</span>}
          </Link>
          <Link to="/group" className="sidebar-item">
            <FaUserFriends className="icon" />
            {isExpanded && <span className="icon-name">Groups</span>}
          </Link>
          <Link to="/requests" className="sidebar-item">
            <FaSearch className="icon" />
            {isExpanded && <span className="icon-name">Requests</span>}
          </Link>
          {/* Logout functionality */}
          <div className="sidebar-item" onClick={handleLogout}>
            <FaSignOutAlt className="icon" />
            {isExpanded && <span className="icon-name">Logout</span>}
          </div>
        </div>
  
        {/* Profile Button */}
        <Link to="/profile" className="profile-button">
          <FaUserCircle className="icon" />
          {isExpanded && <span className="icon-name">Profile</span>}
        </Link>
      </div>
    );
  };
  
  export default Sidebar;