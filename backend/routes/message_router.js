const express = require('express');
const { check } = require('express-validator');

const messagesController = require('../controllers/messagesController');

const router = express.Router();

// Route to send a message (either individual or in a group)
router.post(
    '/send',
    [
        check('senderId')
        .not()
        .isEmpty(),
        check('receiverId')
        .optional(), // optional if it's a group message
        check('groupId')
        .optional(), // optional if it's an individual message
        check('content')
        .not()
        .isEmpty(),
        check('type')
        .isIn(['text', 'image', 'video'])
    ],
    messagesController.sendMessage
);


//to get messages of a group
router.get('/group/:groupId', messagesController.getGroupMessages);

// Route to get messages between two users or within a group
router.get('/:c_userId/:userId', messagesController.getMessages);

// Route to delete a specific message
router.delete('/delete/:messageId', messagesController.deleteMessage);

router.post('/read', messagesController.readMessages);
module.exports = router;

router.get('/unread/:userId', messagesController.unReadMessages);

  