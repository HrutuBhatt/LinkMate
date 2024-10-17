const express = require('express');
const { check } = require('express-validator');

const friendsController = require('../controllers/friendsController');

const router = express.Router();

// Route to get the list of friends for a user
router.get('/check',friendsController.checkFriendshipStatus);
router.get('/:userId',
    [
        check('userId')
        .not()
        .isEmpty()
        .isMongoId().withMessage('Invalid User ID')
    ], 
    friendsController.getFriends
);

// Route to remove a friend
router.delete(
    '/:userId/:friendId',
    [
        check('userId')
        .not()
        .isEmpty(),
        check('friendId')
        .not()
        .isEmpty()
    ],
    friendsController.removeFriend
);

// Route to block a friend
router.patch(
    '/block/:userId/:friendId',
    [
        check('userId')
        .not()
        .isEmpty(),
        check('friendId')
        .not()
        .isEmpty()
    ],
    friendsController.blockFriend
);

// Route to unblock a friend
router.patch(
    '/unblock/:userId/:friendId',
    [
        check('userId')
        .not()
        .isEmpty(),
        check('friendId')
        .not()
        .isEmpty()
    ],
    friendsController.unblockFriend
);


module.exports = router;
