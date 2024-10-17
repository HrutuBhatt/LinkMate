const mongoose = require('mongoose');
const HttpError = require('../controllers/http-error');
const User = require('../models/users');
const FriendRequest = require('../models/friendRequests');
const Friendship = require('../models/friends');

//send friend request
const sendRequest = async (req, res, next) => {
    const { senderId, receiverId } = req.body;
    // console.log(senderId, receiverId);
    let sender, receiver;
    try {
        sender = await User.findById(senderId);
        receiver = await User.findById(receiverId);
      //  console.log(sender, receiver);
    } catch (err) {
        console.log(err);
        const error = new HttpError('Sending friend request failed, please try again.', 500);
        return next(error);
    }

    if (!sender || !receiver) {
        const error = new HttpError('User not found.', 404);
        return next(error);
    }

    const newFriendRequest = new FriendRequest({
        senderId: senderId,
        receiverId: receiverId,
        status: 'pending',
    });

    try {
        await newFriendRequest.save();
    } catch (err) {
        console.log(err);
        const error = new HttpError('Sending friend request failed, please try again.', 500);
        return next(error);
    }

    res.status(201).json({ message: 'Friend request sent.' });
};



// Accept a friend request
const acceptRequest = async (req, res, next) => {
    // const { requestId } = req.body; 
    const requestId  = req.params.requestId; 
    
    let friendRequest;
    try {
        friendRequest = await FriendRequest.findById(requestId);
    } catch (err) {
        const error = new HttpError('Accepting friend request failed, please try again.', 500);
        return next(error);
    }

    if (!friendRequest) {
        const error = new HttpError('Friend request not found.', 404);
        return next(error);
    }

    if (friendRequest.status !== 'pending') {
        const error = new HttpError('This friend request has already been processed.', 400);
        return next(error);
    }

    try {
        // Update the friend request status to accepted
        friendRequest.status = 'accepted';
        await friendRequest.save();

        // Create a new friendship for both users
        const friendship1 = new Friendship({
            user1: friendRequest.senderId,
            user2: friendRequest.receiverId,
        });

        await friendship1.save();


    } catch (err) {
        const error = new HttpError('Accepting friend request failed, please try again.', 500);
        return next(error);
    }

    res.status(200).json({ message: 'Friend request accepted.' });
};

// Function to reject a friend request
const rejectRequest = async (req, res, next) => {
    const requestId = req.params.requestId;

    let friendRequest;
    try {
        friendRequest = await FriendRequest.findById(requestId);
        if (!friendRequest) {
            throw new HttpError('Friend request not found.', 404);
        }

        await FriendRequest.findByIdAndDelete(requestId); // Delete the friend request
    } catch (err) {
        return next(new HttpError('Something went wrong, could not reject the request.', 500));
    }

    res.status(200).json({ message: 'Friend request rejected.' });
};

// Function to cancel a sent friend request
// const cancelRequest = async (req, res, next) => {
//     const { requestId } = req.body;

//     let friendRequest;
//     try {
//         friendRequest = await FriendRequest.findById(requestId);
//         if (!friendRequest) {
//             throw new HttpError('Friend request not found.', 404);
//         }

//         if (friendRequest.sender.toString() !== req.userData.userId) {
//             return next(new HttpError('You are not allowed to cancel this request.', 401));
//         }

//         await FriendRequest.findByIdAndDelete(requestId); // Delete the friend request
//     } catch (err) {
//         return next(new HttpError('Something went wrong, could not cancel the request.', 500));
//     }

//     res.status(200).json({ message: 'Friend request canceled.' });
// };

const cancelRequest = async (req, res, next) => {
    const { senderId, receiverId } = req.body;

    try {
        // Find the friend request where sender and receiver match
        const friendRequest = await FriendRequest.findOne({
            senderId: senderId,
            receiverId: receiverId,
            status: 'pending' // Only allow canceling if the request is still pending
        });

        if (!friendRequest) {
            return res.status(404).json({ message: 'Friend request not found or already processed.' });
        }

        // Verify that the user canceling the request is the sender
        if (friendRequest.senderId.toString() !== senderId) {
            return res.status(401).json({ message: 'Unauthorized to cancel this request.' });
        }

        // Delete the friend request from the database
        await FriendRequest.findByIdAndDelete(friendRequest._id);

        return res.status(200).json({ message: 'Friend request canceled successfully.' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Canceling friend request failed.' });
    }
};

const getStatus = async (req,res,next)=>{
    const { senderId, receiverId } = req.query;

    try {
        // Find the friend request between the two users
        const friendRequest = await FriendRequest.findOne({
            $or: [
                { senderId: senderId, receiverId: receiverId },
                { senderId: receiverId, receiverId: senderId }
            ]
        });

        if (!friendRequest) {
            // If no friend request is found, return a 404 status
            return res.status(404).json({ message: 'No friend request found' });
        }

        // Return the status of the friend request
        return res.status(200).json({
            message: 'Friend request status found',
            status: friendRequest.status
        });

    } catch (error) {
        // Handle any server error
        console.error(error);
        res.status(500).json({ message: 'Checking friend request status failed (in request controller' });
    }
}

const getReceivedRequests = async (req, res, next) => {
    const { userId } = req.params; // current user ID passed as a param
    try {
      const requests = await FriendRequest.find({ receiverId: userId, status: 'pending' })
        .populate('senderId', 'username'); // populate sender's username
  
      if (!requests || requests.length === 0) {
        return res.status(404).json({ message: 'No friend requests found.' });
      }
  
      return res.status(200).json({ requests });
    } catch (err) {
      res.status(500).json({ message: 'Fetching friend requests failed, please try again later.' });
    }
};
  
// const checkFriendshipStatus = async (req, res, next) => {
//     const { userId1, userId2 } = req.query;

//     try {
//         const friendship = await FriendRequest.findOne({
//             $or: [
//                 { senderId: userId1, receiverId: userId2 },
//                 { senderId: userId2, receiverId: userId1 }
//             ],
//             status: 'accepted' // Only check for accepted friend requests
//         });

//         if (friendship) {
//             return res.status(200).json({ status: 'friends' });
//         } else {
//             return res.status(200).json({ status: 'not friends' });
//         }
//     } catch (err) {
//         return next(new HttpError('Checking friendship status failed.', 500));
//     }
// };

module.exports = {
    sendRequest,
    acceptRequest,
    rejectRequest,
    cancelRequest,
    getStatus,
    getReceivedRequests
};