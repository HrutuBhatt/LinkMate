import React, { useState, useEffect, useContext } from 'react';
import './Profile.css';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const Profile = () => {
  const { userId } = useContext(AuthContext);
  const [profile, setProfile] = useState({
    username: '',
    bio: '',
    profilePic: ''
  });
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`/api/users/details/${userId}`);
        const userData = response.data.userone;
        setProfile({
          username: userData.username,
          bio: userData.bio,
          profilePic: userData.profilePic
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, [userId]);

  // Disable button if the username is empty
  useEffect(() => {
    setIsButtonDisabled(profile.username.trim() === '');
  }, [profile.username]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.patch(`/api/users/profile/${userId}`, profile);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-details">
      <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTRCNF19uRrBynAQMTG6A6Y3SFdUtEUbcbttw&s" alt="Profile" className="profile-pic-large" />
        <span><b>{profile.username}</b></span>
        <form onSubmit={handleSubmit} className="profile-form">
          <label>
            Username:
            <input
              type="text"
              name="username"
              value={profile.username}
              onChange={handleChange}
            />
          </label>
          <label>
            Bio:
            <textarea
              name="bio"
              value={profile.bio}
              onChange={handleChange}
            />
          </label>
          <label>
            Profile Picture URL:
            <input
              type="text"
              name="profilePic"
              value={profile.profilePic}
              onChange={handleChange}
            />
          </label>
          <button className="btnProfileUpdate" type="submit" disabled={isButtonDisabled}>Update Profile</button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
