const HttpError = require('../controllers/http-error');
const User = require('../models/users');
const Friend = require('../models/friends');

// Get list of friends for a user
const getFriends = async (req, res, next) => {
    const userId = req.params.userId;
//change required 

    let friendships;
    try {
        friendships = await Friend.find({
            $or: [{ user1: userId }, { user2: userId }],
            //status: 'accepted'
        }).populate('user1 user2', 'username profilePic'); // Populate user details

        const friends = friendships.map(f => {
            const friend = f.user1._id.toString() === userId ? f.user2 : f.user1;
            return {
                id: friend._id,
                username: friend.username,
                profilePic: friend.profilePic
            };
        });

        return res.status(200).json({ friends });
    } catch (err) {
        return next(new HttpError('Fetching friends failed, Error in friends controller', 500));
    }

};

// Remove a friend
const removeFriend = async (req, res, next) => {
    // const userId = req.params.userId;
    // const friendId = req.params.friendId;

    const {userId, friendId} = req.body;

    try {
        const session = await mongoose.startSession();
        session.startTransaction();

        await Friend.deleteOne({ user: userId, friend: friendId }).session(session);
        await Friend.deleteOne({ user: friendId, friend: userId }).session(session);

        await session.commitTransaction();
    } catch (err) {
        const error = new HttpError('Removing friend failed, please try again later.', 500);
        return next(error);
    }

    res.status(200).json({ message: 'Friend removed successfully.' });
};

// Block a friend
const blockFriend = async (req, res, next) => {
    const userId = req.params.userId;
    const friendId = req.params.friendId;

    let friendship;
    try {
        friendship = await Friend.findOne({
            $or: [
                { user1: userId, user2: friendId },
                { user1: friendId, user2: userId }
            ]
        });

        if (!friendship) {
            return next(new HttpError('Friendship not found.', 404));
        }

        friendship.status = 'blocked';
        friendship.blockedBy = userId;
        await friendship.save();

        res.status(200).json({ message: 'Friend blocked successfully.' });
    } catch (err) {
        return next(new HttpError('Blocking friend failed, please try again later.', 500));
    }
};

// Unblock a friend
const unblockFriend = async (req, res, next) => {
    const userId = req.params.userId;
    const friendId = req.params.friendId;

    let friendship;
    try {
        friendship = await Friend.findOne({
            $or: [
                { user1: userId, user2: friendId },
                { user1: friendId, user2: userId }
            ],
            status: 'blocked',
            blockedBy: userId
        });

        if (!friendship) {
            return next(new HttpError('Friendship not found or you are not the one who blocked this friend.', 404));
        }

        friendship.status = 'accepted';
        friendship.blockedBy = null;
        await friendship.save();

        res.status(200).json({ message: 'Friend unblocked successfully.' });
    } catch (err) {
        return next(new HttpError('Unblocking friend failed, please try again later.', 500));
    }
};

const checkFriendshipStatus = async (req, res) => {
    const { senderId, receiverId } = req.query;
    // console.log("hello");
    try {
        // console.log("hi");
      const friendship = await Friend.findOne({
        $or: [
          { user1: senderId, user2: receiverId },
          { user1: receiverId, user2: senderId },
        ],
      });
    //   console.log("hi");
      if (friendship) {
        return res.status(200).json({ status: 'friends' });
      } else {
        return res.status(200).json({ status: 'not_friends' });
      }
    } catch (err) {
        console.log(err);
      res.status(500).json({ message: 'Checking friendship failed.' });
    }
  };

module.exports = {
    getFriends,
    removeFriend,
    blockFriend,
    unblockFriend,
    checkFriendshipStatus
};
