import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './GroupList.css'; // Assuming you want to style it

const GroupList = ({ userId, setSelectedChat, socket }) => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await axios.get(`/api/groups/${userId}/getGroups`);
        setGroups(response.data.groups);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching groups:', err);
        setError('Failed to load groups');
        setLoading(false);
      }
    };

    fetchGroups();
  }, [userId]);

  if (loading) return <div>Loading groups...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="group-list-container">
      <h2>Groups</h2>
      {groups.length === 0 ? (
        <div>No groups found</div>
      ) : (
        <ul className="group-list">
          {groups.map((group) => (
            <li 
              key={group._id} 
              className="group-item"
              onClick={() => setSelectedChat(group)} // Set the selected group to open chat
            >
              {/* {console.log(group._id)}  checked - OK*/}
              <img 
                src="https://via.placeholder.com/50" 
                alt="Group Profile"
                className="group-profile-pic" // Default profile pic
              />
              <div className="group-name">{group.name}</div>
            </li>
            
          ))}
        
        </ul>
      )}
    </div>
  );
};

export default GroupList;