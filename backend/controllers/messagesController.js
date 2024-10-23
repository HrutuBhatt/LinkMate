const HttpError = require('./http-error');
const Message = require('../models/messages'); // Assuming you have a Message model

const Group = require('../models/groups'); // Assuming you have a Group model for group messages
const User = require('../models/users');
const { validationResult } = require('express-validator');
// const multer = require('multer');
const path = require('path');


// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//       cb(null, 'uploads/'); // Set the directory where files will be uploaded
//     },
//     filename: (req, file, cb) => {
//       cb(null, `${Date.now()}-${file.originalname}`);
//     },
//   });

// const upload = multer({ storage });
// Function to send a message (individual or group)
const sendMessage = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ message: 'Invalid inputs passed, please check your data.', errors: errors.array() });
    }

    const { senderId, receiverId, groupId, content, type } = req.body;

    try {
        if (receiverId) {
          const user = await User.findOne({ _id: receiverId, "unreadMessages.senderId": senderId });
      
          if (user) {
            // If the sender is already in the unreadMessages array, increment the count
            await User.updateOne(
              { _id: receiverId, "unreadMessages.senderId": senderId },
              { $inc: { "unreadMessages.$.count": 1 } }
            );
          } else {
            // If the sender is not in the unreadMessages array, add them with count 1
            await User.updateOne(
              { _id: receiverId },
              { $push: { unreadMessages: { senderId, count: 1 } } }
            );
          }
        }
      } catch (err) {
        console.log("Error in notification sending", err);
      }
      
    // const mediaUrl = req.file ? `/uploads/${req.file.filename}` : null;
    if (!receiverId && !groupId ) {
        return res.status(422).json({ message: 'Either receiverId or groupId must be provided.' });
    }
    try
    {
        const sender = await User.findById(senderId);
        if (!sender) {
            return res.status(422).json({ message: 'No such sender ID' });
        }

        // Check if it's a group message
        if (groupId) {
            const group = await Group.findById(groupId);
            if (!group) {
                return res.status(422).json({ message: 'Group not found' });
            }
            // Optionally: Check if the sender is a member of the group
            if (!group.members.includes(senderId)) {
                return res.status(403).json({ message: 'Sender is not a member of the group' });
            }
        } else {
            // It's an individual message, check if the receiver exists
            const receiver = await User.findById(receiverId);
            if (!receiver) {
                return res.status(422).json({ message: 'No such receiver ID' });
            }
        }
        
    }
    catch(err){
        console.error(err);
        const error = new HttpError('Error while getting userId (sender/receiver)', 500);
        return next(error);
    }
    if(content.trim() === ''){
        return res.status(422).json({ message: 'Please enter message' });
    }
    let newMessage;
    try {
        newMessage = new Message({
            sender: senderId,
            receiver: receiverId || null,
            group: groupId || null,
            content,
            type,
            // media: mediaUrl,
            createdAt: new Date(),
            isRead:false
        });

        await newMessage.save();

        if(!groupId){
         // Update the recent field for the sender
        // Step 1: Update the sender's recent array (check if friend exists and update timestamp)
            const sender = await User.findOneAndUpdate(
                {
                    _id: senderId,
                    "recent.friendId": receiverId  // Check if the receiver is already in the recent array
                },
                {
                    $set: {
                        "recent.$.timestamp": new Date()  // Update the timestamp if the friend is found
                    }
                }
            );
            
            // If the friend is not found, add them to the sender's recent array
            if (!sender) {
                await User.findByIdAndUpdate(
                senderId,
                {
                    $addToSet: {
                    recent: {
                        friendId: receiverId,
                        timestamp: new Date()
                    }
                    }
                }
                );
            }
            
            // Step 2: Update the receiver's recent array (check if friend exists and update timestamp)
            const receiver = await User.findOneAndUpdate(
                {
                    _id: receiverId,
                    "recent.friendId": senderId  // Check if the sender is already in the recent array
                },
                {
                    $set: {
                        "recent.$.timestamp": new Date()  // Update the timestamp if the friend is found
                    }
                }
            );
            
            // If the friend is not found, add them to the receiver's recent array
            if (!receiver) {
                await User.findByIdAndUpdate(
                receiverId,
                {
                    $addToSet: {
                    recent: {
                        friendId: senderId,
                        timestamp: new Date()
                    }
                    }
                }
                );
            }
        }
        res.status(201).json({ message: 'Message sent successfully.', messageId: newMessage._id });
    } catch (err) {
        console.error(err);
        const error = new HttpError('Sending message failed, Unknown error occured.', 500);
        return next(error);
    }
    //for notifications
};

// Function to get messages between two users or within a group


const getMessages = async (req, res, next) => {
    const otherUserId = req.params.userId; // The userId of the user being chatted with
    const currentUserId = req.params.c_userId;    // The logged-in user's ID

    // console.log(otherUserId, currentUserId);
    try {
        // Fetch messages exchanged between the current user and the other user
        const messages = await Message.find({
            $or: [
                { sender: currentUserId, receiver: otherUserId },
                { sender: otherUserId, receiver: currentUserId }
            ]
        })
        .populate('sender receiver', 'username') // Populate usernames for both sender and receiver
        .sort({ createdAt: 1 });  // Sort messages by creation date

        // console.log(messages);
        return res.json({ messages: messages.map(m => m.toObject({ getters: true })) });
        // res.json({ messages});
    } 
    catch (err) {
        console.error(err);
        const error = new HttpError('Fetching messages failed, please try again later.', 500);
        return next(error);
    }
};

const getGroupMessages = async(req,res,next)=>{
    const groupId = req.params.groupId;
    try{
        const messages = await Message.find({group: groupId}).populate('sender','username').sort({createdAt:1});
        return res.json({messages:messages.map(m=>m.toObject({getters:true}))});
    }
    catch(err){
        const error = new HttpError('Fetching group messages failed, please try again later.', 500);
        return next(error);
    }
};

// Function to delete a specific message


const deleteMessage = async (req, res, next) => {
    const messageId = req.params.messageId;

    try {
        const message = await Message.findByIdAndDelete(messageId);

        if (!message) {
            const error = new HttpError('Message not found.', 404);
            return next(error);
        }

        res.status(200).json({ message: 'Message deleted successfully.' });
    } 
    catch (err) {
        console.error(err);
        const error = new HttpError('Deleting message failed, please try again later.', 500);
        return next(error);
    }
};

const readMessages = async (req, res) => {
    const { userId, senderId } = req.body;  // User who is reading the messages from a specific sender
  
    // Mark messages from this sender as read
    await Message.updateMany(
      { receiver: userId, sender: senderId, isRead: false }, 
      { isRead: true }
    );
  
    // Reset unread message count for this specific sender
    await User.updateOne(
      { _id: userId },
      { $pull: { unreadMessages: { senderId } } }  // Remove entry for the sender
    );
  
    res.status(200).json({ message: 'Messages marked as read' });
  };
  
  
  const unReadMessages = async (req, res) => {
    try {
      const userId = mongoose.Types.ObjectId(userId); // Convert userId to ObjectId
      const unreadMessages = await Message.find({ receiverId: userId, isRead: false });
      res.json({ unreadMessages });
    } catch (error) {
      console.error('Fetching messages failed:', error);
      res.status(500).send('Fetching messages failed, please try again later.');
    }
  };

module.exports = {
    sendMessage,
    getMessages,
    deleteMessage,
    // markAsSeen,
    getGroupMessages,
    readMessages,
    unReadMessages
};
