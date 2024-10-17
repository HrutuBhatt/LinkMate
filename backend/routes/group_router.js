const express = require('express');
const { check } = require('express-validator');

const groupsController = require('../controllers/groupscontroller');

const router = express.Router();

// Route to create a new group
router.post(
    '/:userId/create',
    [
        check('name')
        .not()
        .isEmpty(),
        // check('adminId')
        // .not()
        // .isEmpty(),
        check('members')
        .isArray({ min: 1 })
    ],
    groupsController.createGroup
);

// Route to get details of a specific group
router.get('/:groupId', groupsController.getGroup);

// all groups of particular member
router.get('/:userId/getGroups',groupsController.ViewGroups);

router.get('/not-in-group/:groupId', groupsController.getUsersNotInGroup);

// Route to add a member to a group
router.post(
    '/:groupId/add-member',
    [
        check('memberId')
        .not()
        .isEmpty()
    ],
    groupsController.addMember
);

// Route to remove a member from a group
router.post(
    '/:groupId/remove-member',
    [
        check('memberId')
        .not()
        .isEmpty()
    ],
    groupsController.removeMember
);

router.post('/:groupId/leave-group', groupsController.leaveGroup);
// Route to delete a group
router.delete('/:groupId', groupsController.deleteGroup);

module.exports = router;
