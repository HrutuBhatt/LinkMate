const express = require('express');
const { check } = require('express-validator');

const friendRequestsController = require('../controllers/friendRequestsController');

const router = express.Router();

router.get('/status', friendRequestsController.getStatus);

//get received requests
router.get('/received/:userId', friendRequestsController.getReceivedRequests);

// Route to send a friend request
router.post(
    '/send',
    [
        check('senderId')
        .not()
        .isEmpty(),
        check('receiverId')
        .not()
        .isEmpty()
    ],
    friendRequestsController.sendRequest
);

// Route to accept a friend request
router.post(
    '/accept/:requestId',
    [
        // check('requestId')
        // .not()
        // .isEmpty(),
        // check('senderId')
        // .not()
        // .isEmpty(),
        // check('receiverId')
        // .not()
        // .isEmpty()
    ],
    friendRequestsController.acceptRequest
);

// Route to reject a friend request
router.post(
    '/reject/:requestId',
    [
    //     check('requestId')
    //     .not()
    //     .isEmpty(),
        // check('senderId')
        // .not()
        // .isEmpty(),
        // check('receiverId')
        // .not()
        // .isEmpty()
    ],
    friendRequestsController.rejectRequest
);

// Route to delete a friend request (e.g., if the request was not accepted or rejected)
router.post('/cancel', friendRequestsController.cancelRequest);

module.exports = router;
