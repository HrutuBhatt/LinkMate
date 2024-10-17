import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './UserProfile.css';

const UserProfile = ({ searchedUserId, currentUserId }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [friendshipStatus, setFriendshipStatus] = useState(null);
  const [friendRequestStatus, setFriendRequestStatus] = useState(null);
  const [receivedRequests, setReceivedRequests] = useState([]);
  
  // Fetch user profile and friendship/friendRequest status
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Fetch the user profile
        const userProfileResponse = await axios.get(`/api/users/details/${searchedUserId}`);
        setUserProfile(userProfileResponse.data.userone);

        // Check friendship status
        const friendshipResponse = await axios.get(`/api/friends/check`, {
          params: { userId1: currentUserId, userId2: searchedUserId }
        });

        // If they are friends, set the friendship status
        if (friendshipResponse.data.status === 'friends') {
          setFriendshipStatus('friends');
        } else {
          // Otherwise, check the friend request status
          const friendRequestResponse = await axios.get(`/api/requests/status`, {
            params: { senderId: currentUserId, receiverId: searchedUserId }
          });
          setFriendRequestStatus(friendRequestResponse.data.status);
        }

        // Fetch received friend requests
        const receivedRequestsResponse = await axios.get(`/api/requests/received/${currentUserId}`);
        setReceivedRequests(receivedRequestsResponse.data.requests);
      } 
      
      catch (error) {
        console.error("Error fetching profile or status:", error);
      }
    };

    fetchUserProfile();
  }, [searchedUserId, currentUserId]);

  // Handle send friend request
  const sendFriendRequest = async () => {
    if (currentUserId === searchedUserId) {
        alert("You cannot send a friend request to yourself.");
        return;
    }
    try {
      await axios.post(`/api/requests/send`, { senderId: currentUserId, receiverId: searchedUserId });
      setFriendRequestStatus('pending');
    } catch (error) {
      console.error("Error sending friend request:", error);
    }
  };

  // Handle cancel friend request
  const cancelFriendRequest = async () => {
    try {
      await axios.post(`/api/requests/cancel`, { senderId: currentUserId, receiverId: searchedUserId });
      setFriendRequestStatus(null);
    } catch (error) {
      console.error("Error canceling friend request:", error);
    }
  };

  // Handle remove friend
  const removeFriend = async () => {
    try {
      await axios.post(`/api/friends/remove`, { userId1: currentUserId, userId2: searchedUserId });
      setFriendshipStatus(null);
    } catch (error) {
      console.error("Error removing friend:", error);
    }
  };

  // Handle accept friend request
  const acceptRequest = async (requestId) => {
    try {
      await axios.post(`/api/requests/accept/${requestId}`);
      setReceivedRequests(receivedRequests.filter(request => request._id !== requestId));
    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
  };

  // Handle reject friend request
  const rejectRequest = async (requestId) => {
    try {
      await axios.post(`/api/requests/reject/${requestId}`);
      setReceivedRequests(receivedRequests.filter(request => request._id !== requestId));
    } catch (error) {
      console.error("Error rejecting friend request:", error);
    }
  };

  if (!userProfile) return <div>Loading...</div>;

  return (
    <>
    <div className="user-profile-container">
      <h2> Username: {userProfile.username}</h2>
      <p> Bio :{userProfile.bio}</p>

      {friendshipStatus === 'friends' ? (
        <>
          <button className="remove-friend" onClick={removeFriend}>Remove Friend</button>
        </>
      ) : (
        <>
          {friendRequestStatus === 'pending' ? (
            <>
              <p>Request Pending</p>
              <button className="cancel-request" onClick={cancelFriendRequest}>Cancel Request</button>
            </>
          ) : friendRequestStatus === 'accepted' ? (
            <>
              <p>You are friends</p>
              <button className="remove-friend" onClick={removeFriend}>Remove Friend</button>
            </>
          ) : (
            <button className="send-request" onClick={sendFriendRequest}>Send Friend Request</button>
          )}
        </>
      )}

      <div className="request-status">
        <h4>Recieved Request: </h4>
        {receivedRequests.length === 0 ? (
          <p>No friend requests received.</p>
        ) : (
          receivedRequests.map(request => (
            <div key={request._id} className="request-item">
              <Link to={`/profile/${request.senderId._id}`}>{request.senderId.username}</Link>
              <button onClick={() => acceptRequest(request._id)}>Accept</button>
              <button onClick={() => rejectRequest(request._id)}>Reject</button>
            </div>
          ))
        )}
      </div>
    </div>

    </>
  );
};

export default UserProfile;





// // src/components/UserProfile.js
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// const UserProfile = ({ selectedUser, currentUserId }) => {
//   const [isFriend, setIsFriend] = useState(false);

//   useEffect(() => {
//     const checkFriendship = async () => {
//       try {
//         const response = await axios.get(`/api/friends/check`, {
//           senderId: currentUserId,
//           receiverId: selectedUser._id,
//         });
//         setIsFriend(response.data.status === 'friends');
//       } catch (error) {
//         console.error('Error checking friendship status:', error);
//       }
//     };
//     checkFriendship();
//   }, [selectedUser, currentUserId]);

//   const handleSendRequest = async () => {
//     try {
//       await axios.post('/api/requests/send', { senderId: currentUserId, receiverId: selectedUser._id });
//       alert('Friend request sent!');
//     } catch (error) {
//       console.error('Error sending friend request:', error);
//     }
//   };

//   const handleRemoveFriend = async () => {
//     // Remove friend logic here
//   };

//   return (
//     <div>
//       <h2>{selectedUser.username}</h2>
//       <p>{selectedUser.bio}</p>
//       {isFriend ? (
//         <button onClick={handleRemoveFriend}>Remove Friend</button>
//       ) : (
//         <button onClick={handleSendRequest}>Send Friend Request</button>
//       )}
//     </div>
//   );
// };

// export default UserProfile;
