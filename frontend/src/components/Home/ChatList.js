import React, { useState, useEffect } from 'react';
import './ChatList.css';
import axios from 'axios';
import PropTypes from 'prop-types';

const ChatList = ({ setSelectedChat, userId, socket }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [chatListData, setChatListData] = useState([]);
  const [unreadChats, setUnreadChats] = useState([]); // Tracks which chats have unread messages
  const [isChatListEmpty, setIsChatListEmpty] = useState(false);
  const [onlineStatus, setOnlineStatus] = useState(new Map());
  useEffect(() => {
    const fetchChatListData = async () => {
      try {
        const response = await axios.get(`/api/users/chatlist/${userId}`);
        console.log(response);
        const chats = response.data.users || [];

        if (chats.length === 0) {
          setIsChatListEmpty(true);
        } else {
          setIsChatListEmpty(false); // Reset when chatList is populated
        }
        const unreadResponse = await axios.get(`/api/messages/unread/${userId}`);
        setUnreadChats(unreadResponse.data.unreadChats || []);
        setChatListData(chats);
      } catch (error) {
        console.error('Error fetching chat list data:', error);
      }
    };
    
    fetchChatListData();
  }, [userId]);

  //for checking online status
  useEffect(() => {
    console.log(socket);
    if (!socket) return;
    // Listen for userStatus events from the server
    socket.on('userStatus', ({ userId, status }) => {
      setOnlineStatus((prevStatus) => {
        const updatedStatus = new Map(prevStatus);
        updatedStatus.set(userId, status);
        return updatedStatus;
      });
    });

    return () => {
      socket.off('userStatus'); // Clean up the event listener
    };
  }, [socket]);


  // Handle search based on the chat list's status
  useEffect(() => {
    if (searchTerm.trim()) {
    // if(){
      const fetchSearchData = async () => {
        try {
          const response = await axios.get(`/api/users/search`, {
            params: { searchTerm }
          });
          setChatListData(response.data.users || []);
        } catch (error) {
          console.error('Error fetching search data:', error);
        }
      };

      fetchSearchData();
    } else {
      // Reset chat list when search term is cleared
      const fetchChatListData = async () => {
        try {
          const response = await axios.get(`/api/users/chatlist/${userId}`);
          setChatListData(response.data.users || []);
        } catch (error) {
          console.error('Error fetching chat list data:', error);
        }
      };

      fetchChatListData();
    }
  }, [searchTerm, userId]);

  //for unread messages/chats

  // const handleChatClick = (chat)=>{
  //   setSelectedChat(chat);
  //   setUnreadChats((prevUnread)=>prevUnread.filter((id=>id!==chat.id)));
  // }

  return (
    <div className="chat-list">
      {/* Search Bar */}
      <div className="chat-search">
        <input
          type="text"
          placeholder={isChatListEmpty ? 'Search users to start chatting...' : 'Search users...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* List of Chats or Search Results */}
      <ul className="chat-list-items">
        {chatListData.map((chat) => {
          const chatId = chat.friendId ? chat.friendId._id : chat._id;
          const isUnread = unreadChats.includes(chatId); // Check if this chat has unread messages
          return (
            <li
              key={chatId} // Use friendId if available, otherwise use userId
              className="chat-item"
              onClick={() => setSelectedChat(chat)}
            >
              <img
                src="https://static.vecteezy.com/system/resources/previews/026/619/142/original/default-avatar-profile-icon-of-social-media-user-photo-image-vector.jpg"
                alt={chat.friendId ? chat.friendId.username : chat.username}
                className="profile-pic"
              />
              <div className="chat-info">
                <h4>{chat.friendId ? chat.friendId.username : chat.username}</h4>
                {/* Green dot for unread messages */}
                {isUnread && <span className="green-dot"></span>}
              </div>
            </li>
          );
        })}
      </ul>

      {/* No Results Message */}
      {chatListData.length === 0 && searchTerm && (
        <p>No users found with the name "{searchTerm}".</p>
      )}
    </div>
  );
};

ChatList.propTypes = {
  setSelectedChat: PropTypes.func.isRequired,
  userId: PropTypes.string.isRequired,
  socket: PropTypes.object
};

export default ChatList;



// import React, { useState, useEffect } from 'react';
// import './ChatList.css';
// import axios from 'axios';
// import PropTypes from 'prop-types';

// const ChatList = ({ setSelectedChat, userId }) => {
//   const [searchTerm, setSearchTerm] = useState('');
//   const [chatListData, setChatListData] = useState([]);

//   useEffect(() => {
//     const fetchChatListData = async () => {
//       try {
//         const response = await axios.get(`/api/users/search`, {
//           params: { searchTerm } // Pass searchTerm as a query parameter
//         });
//         setChatListData(response.data.users || []); // Ensure it defaults to an empty array if undefined
//       } catch (error) {
//         console.error('Error fetching chat list data:', error);
//       }
//     };

//     fetchChatListData();
//   }, [searchTerm]); // Fetch data whenever searchTerm changes

//   return (
//     <div className="chat-list">
//       {/* Search Bar */}
//       <div className="chat-search">
//         <input
//           type="text"
//           placeholder="Search users..."
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//         />
//       </div>

//       {/* List of Chats */}
//       <ul className="chat-list-items">
//         {chatListData.map(chat => (
//           <li
//             key={chat._id} // Adjust key based on your data
//             className="chat-item"
//             onClick={() => setSelectedChat(chat)}
//           >
//             <img src={chat.profilePic} alt={chat.username} className="profile-pic" />
//             <div className="chat-info">
//               <h4>{chat.username}</h4>
//             </div>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// ChatList.propTypes = {
//   setSelectedChat: PropTypes.func.isRequired,
//   userId: PropTypes.string.isRequired
// };

// export default ChatList;


// import React, { useState, useEffect, useContext } from 'react';
// import './ChatList.css';
// import axios from 'axios';
// import PropTypes from 'prop-types';


// const ChatList = ({ setSelectedChat, userId, socket }) => {
//   const [searchTerm, setSearchTerm] = useState('');
//   const [chatListData, setChatListData] = useState([]);

//   // useEffect(() => {
//   //   const fetchSearchData = async () => {
//   //     try {
//   //       const response = await axios.get(/api/users/search, {
//   //         params: { searchTerm } // Pass searchTerm as a query parameter
//   //       });
//   //       setChatListData(response.data.users || []); // Ensure it defaults to an empty array if undefined
//   //     } catch (error) {
//   //       console.error('Error fetching chat list data:', error);
//   //     }
//   //   };

//   //   fetchSearchData();
//   // }, [searchTerm]);

//   useEffect(()=>{
//     const fetchChatListData = async()=>{
//       try{
//         const response = await axios.get(/api/users/chatlist/${userId});
//         setChatListData(response.data.users || []);
//       }
//       catch(error){
//         console.log('Error fetching chat list data: ', error);
//       }
//     }

//     fetchChatListData();
//   }, [userId]);

//   return (
//     <div className="chat-list">
//       {/* Search Bar */}
//       <div className="chat-search">
//         <input
//           type="text"
//           placeholder="Search users..."
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//         />
//       </div>

//       {/* List of Chats */}
//       <ul className="chat-list-items">
//         {chatListData.map(chat => (
//           <li
//             key={chat.friendId._id}
//             className="chat-item"
//             onClick={() => setSelectedChat(chat)}
//           >
//             <img src="https://static.vecteezy.com/system/resources/previews/026/619/142/original/default-avatar-profile-icon-of-social-media-user-photo-image-vector.jpg" alt={chat.friendId.username} className="profile-pic" />
//             <div className="chat-info">
//               <h4>{chat.friendId.username}</h4>
//             </div>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// ChatList.propTypes = {
//   setSelectedChat: PropTypes.func.isRequired,
//   userId: PropTypes.string.isRequired,
//   socket: PropTypes.object // Pass socket to handle real-time events
// };

// export default ChatList;