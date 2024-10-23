import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 

import './GroupChatArea.css';

const GroupChatArea = ({ group, userId, socket }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showPopup, setShowPopup] = useState(false); 
  const [selectedMessage, setSelectedMessage] = useState(null);
  const navigate = useNavigate();
  
//   console.log(group._id);
  useEffect(() => {
    const fetchGroupMessages = async () => {
      try {
        const response = await axios.get(`/api/messages/group/${group._id}`); 
        setMessages(response.data.messages);
      } catch (error) {
        console.error('Error fetching group messages:', error);
      }
    };

    fetchGroupMessages();

    if (socket) {
      socket.on('receiveGroupMessage', (message) => {
        if (message.group._id === group._id) {
          setMessages((prevMessages) => [...prevMessages, message]);
        }
      });
    }

    return () => {
      if (socket) socket.off('receiveGroupMessage');
    };
  }, [group, socket, userId]);

  const handleSendMessage = async () => {
    if (newMessage.trim() !== '') {
      const messageData = {
        groupId: group._id,
        senderId: userId,
        content: newMessage,
        type: "text",
        timestamp: new Date()
      };

      socket.emit('sendGroupMessage', messageData);

      setMessages((prevMessages) => [...prevMessages, {
        ...messageData,
        sender: { _id: userId, username: 'You' },
        group: { _id: group._id }
      }]);

      try {
        await axios.post(`/api/messages/send`, messageData);
        
      } catch (error) {
        console.error('Error sending group message:', error);
      }

      setNewMessage('');
    }
  };

  const handleGroupClick = () => {
    navigate(`/group/${group._id}/members`);  // Navigate to the group members page
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.toLocaleTimeString()} ${date.toLocaleDateString()}`;
  };

  if (!group) {
    return <div className="group-chat-area">Select a group to start messaging</div>;
  }
  
  return (
    <div className="group-chat-area">
      <div className="group-chat-header" onClick={handleGroupClick} style={{ cursor: 'pointer' }}>
        <h2>{group.name}</h2>
      </div>
      <div className="group-chat-messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.sender && msg.sender._id === userId ? 'outgoing' : 'incoming'}`}
          >
            <label className="username">{msg.sender ? msg.sender.username : 'undefined'}</label><br/>
            {msg.content}
            <div className="timestamp">{formatTimestamp(msg.timestamp)}</div>
          </div>
        ))}
      </div>
      <div className="group-chat-input">
        <input
          type="text"
          value={newMessage}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          placeholder="Type a message..."
        />

        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default GroupChatArea;
