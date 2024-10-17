import React, { useState, useEffect, useContext } from 'react';
import {io} from 'socket.io-client'; // Import socket.io-client
import ChatList from './ChatList';
import ChatArea from './ChatArea';
import './HomePage.css';
import { AuthContext } from '../../context/AuthContext'; 

const HomePage = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const { userId } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Connect to the backend socket.io server
    const newSocket = io('http://localhost:5000'); // Use your server's URL
    setSocket(newSocket);

    return () => {
      newSocket.close(); // Cleanup the socket connection when component unmounts
    };
  }, [userId]);

  return (
    <div className="app-container">
      {userId && (
        <ChatList 
          setSelectedChat={setSelectedChat} 
          userId={userId} 
          socket={socket} // Pass socket to child components
        />
      )}
      {selectedChat && (
        <ChatArea 
          chat={selectedChat} 
          userId={userId} 
          socket={socket} // Pass socket to child components
        />
      )}
    </div>
  );
};

export default HomePage;



// import React, { useState,useContext } from 'react';
// import ChatList from './ChatList';
// import ChatArea from './ChatArea';
// import './HomePage.css';
// import { AuthContext } from '../../context/AuthContext'; 

// const HomePage = () => {
//   const [selectedChat, setSelectedChat] = useState(null);
//   // const [userId, setUserId] = useState(null);

//   // useEffect(() => {
//   //   // Replace with actual user authentication logic
//   //   const loggedInUserId = '12345'; // Get the logged-in user's ID
//   //   setUserId(loggedInUserId);
//   // }, []);

//   const { userId } = useContext(AuthContext);
//   return (
//     <div className="app-container">
//       {userId && <ChatList setSelectedChat={setSelectedChat} userId={userId} />}
//       {selectedChat && <ChatArea chat={selectedChat} />}
//     </div>
//   );
// };

// export default HomePage;
