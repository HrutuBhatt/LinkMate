import React, { useState, useEffect } from 'react';
// import { io } from 'socket.io-client'; /
import './ChatArea.css';
import axios from 'axios';
import Picker from 'emoji-picker-react';

const ChatArea = ({ chat, userId, socket }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showPopup, setShowPopup] = useState(false); // Track whether the popup is shown
  const [selectedMessage, setSelectedMessage] = useState(null); // Track the selected message
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);


  // console.log(chat._id);
  // const socket = io('http://localhost:5000');

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`/api/messages/${userId}/${chat.friendId ? chat.friendId._id : chat._id}`); // Fetch chat messages from the backend
        setMessages(response.data.messages);
        // console.log(response.data.messages);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }

      console.log(chat);
    };

    // console.log(chat._id);
    fetchMessages();

    // Listen for incoming messages via socket
    if (socket) {
      socket.on('receiveMessage', (message) => {
        if (message.receiver._id === (chat.friendId ? chat.friendId._id : chat._id) && message.senderId === (chat.friendId ? chat.friendId._id : chat._id )) {
          setMessages((prevMessages) => [...prevMessages, message]);
        }
      });
    }

    return () => {
      if (socket) socket.off('receiveMessage');
    };
  }, [chat, socket, userId]);

  const handleSendMessage = async () => {
    if (newMessage.trim() !== '') {
      const messageData = {
        receiverId: chat.friendId ? chat.friendId._id : chat._id ,
        senderId: userId,
        content: newMessage,
        type: "text",
        timestamp: new Date() ,  //changed recently,
        //notification
        unread: true
      };

      // Emit the message to the server via socket
      socket.emit('sendMessage', messageData);

      //changed recently
      // Immediately update the local message list to reflect the new message
      setMessages((prevMessages) => [...prevMessages, { 
        ...messageData, 
        sender: { _id: userId, username: 'You' }, // Temporary 'sender' info for the local state
        receiver: { _id: chat.friendId ? chat.friendId._id : chat._id} 
      }]);

      try {
        await axios.post(`/api/messages/send`, messageData);
      } catch (error) {
        console.error('Error sending message:', error);
      }

      // setMessages([...messages,newMessage]); //commented recently
      setNewMessage('');
    }
  };

  // const handleSendMessage = async () => {
  //   if (newMessage.trim() !== '' || selectedFile) {
  //     const formData = new FormData();
  //     formData.append('receiverId', chat.friendId ? chat.friendId._id : chat._id);
  //     formData.append('senderId', userId);
  //     formData.append('content', newMessage);
  //     formData.append('type', selectedFile ? 'file' : 'text'); // Set the type based on whether a file is included
  //     formData.append('timestamp', new Date());
  //     formData.append('unread', true);
  
  //     // If there is a file, append it to the formData
  //     if (selectedFile) {
  //       formData.append('media', selectedFile); // Append the selected file to the formData
  //     }
  
  //     try {
  //       const response = await axios.post('/api/messages/send', formData, {
  //         headers: {
  //           'Content-Type': 'multipart/form-data', // Set header for file upload
  //         },
  //       });
  
  //       // Emit the message to the server via socket
  //       const messageData = response.data; // Get the saved message data from the server
  
  //       socket.emit('sendMessage', messageData);
  
  //       // Immediately update the local message list to reflect the new message
  //       setMessages((prevMessages) => [...prevMessages, {
  //         ...messageData,
  //         sender: { _id: userId, username: 'You' }, // Temporary 'sender' info for the local state
  //         receiver: { _id: chat.friendId ? chat.friendId._id : chat._id },
  //       }]);
  
  //       setNewMessage('');
  //       setSelectedFile(null); // Clear the file input after sending
  //     } catch (error) {
  //       console.error('Error sending message:', error);
  //     }
  //   }
  // };
  
  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };
  //Date time formatter
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.toLocaleTimeString()} ${date.toLocaleDateString()}`;
  };

  const handleRightClick = (e, msg) => {
    e.preventDefault();

    setSelectedMessage(msg); // Store the index of the message clicked
    setShowPopup(true); // Show the popup at the center
  };

  const handleDeleteMessage = (type) => {
    console.log(type, "here");
    if (type === 'deleteForMe') {
      setMessages(messages.filter((_, index) => index._id !== selectedMessage._id));
    } 
    else if (type === 'deleteForEveryone') {
      if(selectedMessage.sender._id === userId){   //included recently
        const messageId = selectedMessage._id;
        console.log(messageId);
        const deleteMessage = async () => {
          try {
            await axios.delete(`/api/messages/delete/${messageId}`); // Fetch chat messages from the backend
            setMessages(messages.filter((msg) => msg._id !== messageId)); // Remove message from state          // console.log(response.data.messages);
          } catch (error) {
            console.error('Error deleting message:', error);
          }
        };
    
        deleteMessage();
      }
      setMessages(messages.filter((_, index) => index !== selectedMessage)); // In a real app, you would handle this server-side too.
    }
    setShowPopup(false); // Close the popup after action
  };

  if (!chat) {
    return <div className="chat-area">Select a chat to start messaging</div>;
  }

  const handleEmojiClick = (event, emojiObject) => {
    // Append the selected emoji to the message input
    setNewMessage(prevMessage => prevMessage + emojiObject.emoji);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]); // Store the selected file in state
    }
  };

  return (
    <div className="chat-area">
      <div className="chat-header">
        <img src="https://tse4.mm.bing.net/th?id=OIP.aIcKkrfqTSfQLSxj795W1wHaHa&pid=Api&P=0&h=180" alt={chat.username || chat.friendId.username} className="chat-profile-pic" />
        <h2 onClick={()=>{setShowProfile(!showProfile)}}>
            {chat.friendId ? chat.friendId.username : chat.username}
        </h2>
        {/* <button onClick={displayProfile(chat)}></button> */}

      {showProfile && (
                // Profile View
                <div className="profile-popup">
                <div className="profile-header">
                  <h2>{chat.friendId ? chat.friendId.username : chat.username}</h2>
                  {/* <button className="close-button" onClick={onClose}>
                    &times; 
                  </button> */}
                </div>
                <div className="profile-content">
                  <img
                    src={chat.friendId ? chat.friendId.profilePicture : 'https://tse4.mm.bing.net/th?id=OIP.aIcKkrfqTSfQLSxj795W1wHaHa&pid=Api&P=0&h=180'}
                    alt={chat.friendId ? chat.friendId.username : chat.username}
                    className="profile-pic"
                  />
                  <p className="bio">{chat.friendId ? chat.friendId.bio : chat.bio}</p>
                </div>
              </div>
      )}
      </div>
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.sender && msg.sender._id === userId ? 'outgoing' : 'incoming'}`}
            onContextMenu={(e) => handleRightClick(e, msg)} 
          >
          <label className="username">{msg.sender ? msg.sender.username : "undefined"}</label><br/>
            {msg.content}
            <div className="timestamp">  {formatTimestamp(msg.timestamp)}</div>
          </div>
        )

        )}
      </div>

    {/* <div className="chat-messages">
      {messages.map((msg, index) => (
        <div
          key={index}
          className={`message ${msg.sender && msg.sender._id === userId ? 'outgoing' : 'incoming'}`}
          onContextMenu={(e) => handleRightClick(e, msg)} 
        >
          <label className="username">{msg.sender ? msg.sender.username : "undefined"}</label><br/>
          
          {msg.media ? (
            <div>
              <a href={msg.media} target="_blank" rel="noopener noreferrer">
                View Attachment
              </a>
            </div>
          ) : (
            <div>{msg.content}</div>
          )}
          
          <div className="timestamp">  {formatTimestamp(msg.timestamp)}</div>
        </div>
      ))}
    </div> */}

      {showEmojiPicker && (
        <Picker onEmojiClick={handleEmojiClick} />
      )}
      <div className="chat-input">
      <span onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
        😊 {/* This button toggles the emoji picker */}
      </span>
        <input
          type="text"
          value={newMessage}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          placeholder="Type a message..."
        />
      {/* for file upload */}
        <input
          type="file"
          onChange={(e) => handleFileChange(e)}
          style={{ display: 'none' }} 
          id="fileUpload"
        />
        <label htmlFor="fileUpload" style={{ cursor: 'pointer' }}>
          <img src='https://cdn-icons-png.flaticon.com/512/54/54848.png' className="attach"></img>
        </label>
        <button onClick={handleSendMessage}>Send</button>
      </div>

      {/* Popup for message deletion in the center of the screen */}
      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <div onClick={() => handleDeleteMessage('deleteForMe')}>Delete from Me</div>
            <hr className="thin-line" />
            <div onClick={() => handleDeleteMessage('deleteForEveryone')}>
              Delete from Everyone
            </div>
          </div>
        </div>
      )}
     
    </div>
    
  );
};

export default ChatArea;



