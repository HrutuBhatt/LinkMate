import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import './Group.css';

const GroupCreate = () => {
  const [groupName, setGroupName] = useState('');
  const [users, setUsers] = useState([]); // All available users to choose from
  const [selectedMembers, setSelectedMembers] = useState([]); // Selected members for the group
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const {userId} = useContext(AuthContext);
  // console.log(userId);
  // Fetch users to display as potential group members
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/api/users/'); // Assuming you have a route that returns all users
        setUsers(response.data.users); // Populate the list of users
      } catch (err) {
        console.error('Error fetching users', err);
      }
    };
    fetchUsers();
  }, []);

  // Handle group creation form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (groupName.trim() === '') {
      setError('Group name is required');
      return;
    }

    if (selectedMembers.length === 0) {
      setError('Please select at least one member');
      return;
    }

    setError('');

    const groupData = {
      name: groupName,
      members: selectedMembers, // List of selected member IDs
    };

    try {
      // Create group API call
      const response = await axios.post(`/api/groups/${userId}/create/`, groupData);
      setSuccessMessage('Group created successfully!');
      setGroupName('');
      setSelectedMembers([]);
    } catch (err) {
      console.log(groupData);
      console.error('Error creating group:', err);
      setError('Failed to create group');
    }
  };

  // Handle selection of members from the list
  const handleMemberSelect = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions);
    const selectedIds = selectedOptions.map(option => option.value);
    console.log(selectedIds);
    setSelectedMembers(selectedIds); // Update selected members with the selected user IDs
  };

  return (
    <div className="group-create-container">
      <h2>Create a Group</h2>
      {error && <div className="error">{error}</div>}
      {successMessage && <div className="success">{successMessage}</div>}
      
      <form onSubmit={handleSubmit}>
        <div>
          <label>Group Name:</label>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Enter group name"
            required
          />
        </div>
  
        <div>
          <label>Select Members:</label><br></br>
          <select
            multiple
            value={selectedMembers}
            onChange={handleMemberSelect}
            required
          >
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.username}
              </option>
            ))}
          </select>
        </div>
  
        <button type="submit">Create Group</button>
      </form>
    </div>
  );
};

export default GroupCreate;
