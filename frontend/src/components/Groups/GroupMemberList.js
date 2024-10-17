import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate} from 'react-router-dom';
import axios from 'axios';
import {AuthContext} from '../../context/AuthContext'; // Assuming you have an AuthContext for user info
import './GroupMemberList.css';
const GroupMemberList = () => {
  const { groupId } = useParams();
  // console.log(groupId);
  const navigate = useNavigate();
  const { userId } = useContext(AuthContext); // Retrieve current user from AuthContext
  // const history = useHistory();

  const [group, setGroup] = useState(null);
  const [rightClickMember, setRightClickMember] = useState(null);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [usersToAdd, setUsersToAdd] = useState([]); // Users who are not in the group

  const isAdmin = userId === group?.admin._id;
  // console.log(group.admin._id);
// console.log(isAdmin);
  // Fetch group details and members
  useEffect(() => {
    const fetchGroupDetails = async () => {
      try {
        const response = await axios.get(`/api/groups/${groupId}`);
        setGroup(response.data.groups);
        // console.log(response.data.groups);
        // console.log(group);
      } catch (error) {
        console.error('Error fetching group details:', error);
      }
    };

    fetchGroupDetails();
  }, [groupId]);

  //handle exit group
  const handleExitGroup = async()=>{
    try{
      await axios.post(`/api/groups/${groupId}/leave-group`,{userId});
      alert('You have left the group.');
      // history.push('/groups');
      navigate('/group'); 
    }
    catch(error){
      console.log('Error leaving group: ',error);
    }
  };

  const handleRightClick = (event, member) => {
    event.preventDefault(); // Prevent default right-click menu
    setRightClickMember(member);
    setContextMenuPosition({ x: event.pageX, y: event.pageY });
    setShowContextMenu(true);
  };

  const handleCloseContextMenu = () => {
    setShowContextMenu(false);
    setRightClickMember(null);
  };

  const handleRemoveMember = async (memberId) => {
    try {
      console.log(memberId, groupId);
      await axios.post(`/api/groups/${groupId}/remove-member`, { memberId });
      setGroup((prevGroup) => ({
        ...prevGroup,
        members: prevGroup.members.filter((member) => member._id !== memberId),
      }));
    } catch (error) {
      console.error('Error removing member:', error);
    }
    handleCloseContextMenu();
  };

  const handleViewProfile = (memberId) => {
    console.log(`Viewing profile of member with ID: ${memberId}`);
    handleCloseContextMenu();
  };


  //change from here...
  const handleAddMember = async (selectedUserId) => {
    try {
      const response = await axios.post(`/api/groups/${groupId}/add-member`, { memberId: selectedUserId });
      const newMember = response.data.newMember;
      setGroup((prevGroup) => ({
        ...prevGroup,
        members: [...prevGroup.members, newMember],
      }));
    } catch (error) {
      console.error('Error adding member:', error);
    }
  };

  const openAddMemberModal = async () => {
    setShowAddMemberModal(true);
    // console.log(showAddMemberModal);
    try {
      const response = await axios.get(`/api/groups/not-in-group/${groupId}`); // Get users not in the group
      setUsersToAdd(response.data.users);
    } catch (error) {
      console.error('Error fetching users to add:', error);
    }
  };

  const closeAddMemberModal = () => {
    setShowAddMemberModal(false);
  };

  if (!group) {
    return <div>Loading group members...</div>;
  }

  return (
    <div className="group-chat-area">
      <div className="group-chat-header">
        <h2>{group.name}</h2>
      </div>

      {/* Group members list */}
      <div className="group-members-list">
        <h3>Group Members</h3>
        <ul>
          {/* Admin first */}
          <li className="group-member-tile admin">
            <span>{group.admin.username} (Admin)</span>
          </li>

          {/* Other members */}
          {group.members
          .filter(member => member._id !== group.admin._id)  // Filter out the admin
          .map((member) => (
            <li
              key={member._id}
              className="group-member-tile"
              onContextMenu={(e) => handleRightClick(e, member)}
            >
              <span>{member.username}</span>
            </li>
          ))}
        </ul>

        {/* Add member button (Only visible to admin) */}
        {isAdmin && (
          <button className="add-member-btn" onClick={openAddMemberModal}>
            Add Members
          </button>
        )}
      </div>

      {/* Right-click context menu */}
      {showContextMenu && (
        <div
          className="context-menu"
          style={{ top: `${contextMenuPosition.y}px`, left: `${contextMenuPosition.x}px` }}
        >
          {/* Debugging to ensure that rightClickMember is set */}
          {console.log('Context menu open for member:', rightClickMember)}
          {console.log(isAdmin)}
          {isAdmin && rightClickMember && ( // Ensure rightClickMember is defined before calling handleRemoveMember
            <div className="context-menu-option" onClick={() => {
              console.log('Clicked Remove for member:', rightClickMember._id); // Debugging
              handleRemoveMember(rightClickMember._id);
            }}>
              Remove Member
            </div>
          )}

          {rightClickMember && (
            <div className="context-menu-option" onClick={() => {
              console.log('Clicked View Profile for member:', rightClickMember._id); // Debugging
              handleViewProfile(rightClickMember._id);
            }}>
              View Profile
            </div>
          )}
        </div>
      )}


      {/* Click outside to close context menu */}
      {showContextMenu && <div className="backdrop" onClick={handleCloseContextMenu} />}

      {/* Add Member Modal */}
      {/* {console.log(showAddMemberModal)} */}
      {showAddMemberModal && (
        <div className="usermodal">
          <h3>Select users to add:</h3>
          <ul>
            {console.log(usersToAdd)}
            {usersToAdd.map((user) => (
          
              <li key={user._id} onClick={() => handleAddMember(user._id)}>
                {user.username}
              </li>
            ))}
          </ul>
          <button onClick={closeAddMemberModal}>Close</button>
        </div>
      )}
      
      {/*Exit group Button */}
      <div className="exit-group-btn">
        <button onClick={handleExitGroup}>
          {isAdmin ? 'Exit and Assign New Admin' : 'Exit Group'}
        </button>
      </div>
    </div>
    
  );
};

export default GroupMemberList;
