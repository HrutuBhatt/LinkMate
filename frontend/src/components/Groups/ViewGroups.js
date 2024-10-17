import React, { useState, useEffect, useContext } from 'react';
import io from 'socket.io-client'; // Import socket.io-client
import GroupList from './GroupList';
import GroupChatArea from './GroupChatArea';
import { AuthContext } from '../../context/AuthContext'; 

const ViewGroups = () => {
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
        <GroupList 
          setSelectedChat={setSelectedChat} 
          userId={userId} 
          socket={socket} // Pass socket to child components
        />
      )}
      {selectedChat && (
        <GroupChatArea 
          group={selectedChat} 
          userId={userId} 
          socket={socket} // Pass socket to child components
        />
      )}
    </div>
  );
};

export default ViewGroups;


