const HttpError = require('./http-error');
const User = require('../models/users');
const Group = require('../models/groups');
const { validationResult } = require('express-validator');

const createGroup = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError('Error in data passed', 422));
    }

    const userId = req.params.userId;
    const { name, members } = req.body;

    try {
        // Verify the admin user exists
        const admin = await User.findById(userId);
        if (!admin) {
            return next(new HttpError('Admin user not found', 404));
        }

        for (let memberId of members) {
            const member = await User.findById(memberId);
            if (!member) {
                return next(new HttpError(`Member with ID ${memberId} not found`, 404));
            }
        }

        if (!members.includes(userId)) {
            members.push(userId); // Add admin as a member
        }      

        const newGroup = new Group({
            name,
            admin: userId, // Directly assigning the userId as admin
            members
        });

        await newGroup.save();

        // Optionally populate the response
        const populatedGroup = await newGroup.populate('admin members', 'username email profilePic');

        return res.status(201).json({ groupId: populatedGroup.id, admin: populatedGroup.admin, members: populatedGroup.members });
    } catch (err) {
        console.error(err);
        return next(new HttpError('Failed to create group', 500));
    }
};

const getGroup = async(req,res,next)=>{
    const gid = req.params.groupId;

    let userGroup;
    try {
        userGroup = await Group.findById(gid).populate('admin', 'username').populate('members', 'username');
    } catch (err) {
        return next(new HttpError('Fetching group failed, please try again later.', 500));
    }
    if (!userGroup || userGroup.length === 0) {
        return next(new HttpError('Could not find group for the provided user id.', 404));
    }
    res.json({ groups: userGroup.toObject({ getters: true }) });
}

const ViewGroups= async(req,res,next)=>{
    const userId = req.params.userId;

    let userGroups;
    try {
        userGroups = await Group.find({ members: userId }).populate('admin', 'username').populate('members', 'username');
    } catch (err) {
        return next(new HttpError('Fetching groups failed, please try again later.', 500));
    }

    if (!userGroups || userGroups.length === 0) {
        return next(new HttpError('Could not find groups for the provided user id.', 404));
    }

    return res.json({ groups: userGroups.map(group => group.toObject({ getters: true })) });
};

const addMember = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid inputs passed, please check your data.', 422));
    }

    const { groupId } = req.params;
    const { memberId } = req.body;

    let group;
    try {
        group = await Group.findById(groupId);
        if (!group) {
            return next(new HttpError('Group not found', 404));
        }

        // Check if the member is already in the group
        if (group.members.includes(memberId)) {
            return next(new HttpError('Member already in the group', 422));
        }

        group.members.push(memberId);
        await group.save();

        return res.status(200).json({ message: 'Member added successfully', group: group.toObject({ getters: true }) });
    } catch (err) {
        return next(new HttpError('Adding member failed, please try again later.', 500));
    }
};

// 3. Remove a member from a group
const removeMember = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid inputs passed, please check your data.', 422));
    }

    const { groupId } = req.params;
    const { memberId } = req.body;

    let group;
    try {
        group = await Group.findById(groupId);
        if (!group) {
            return next(new HttpError('Group not found', 404));
        }

        // Check if the member is in the group
        if (!group.members.includes(memberId)) {
            return next(new HttpError('Member not in the group', 422));
        }

        group.members.pull(memberId);
        await group.save();

        return res.status(200).json({ message: 'Member removed successfully', group: group.toObject({ getters: true }) });
    } catch (err) {
        return next(new HttpError('Removing member failed, please try again later.', 500));
    }
};

// 4. Delete a group
const deleteGroup = async (req, res, next) => {
    const { groupId } = req.params;

    let group;
    try {
        group = await Group.findById(groupId);
        if (!group) {
            return next(new HttpError('Group not found', 404));
        }

        await group.remove();

        res.status(200).json({ message: 'Group deleted successfully' });
    } catch (err) {
        return next(new HttpError('Deleting group failed, please try again later.', 500));
    }
};

//5. Get users not part of the group
const getUsersNotInGroup = async (req, res, next) => {
    const { groupId } = req.params;
    
    try {
        const group = await Group.findById(groupId).populate('members');
        if (!group) {
            return next(new HttpError('Group not found', 404));
        }

        const groupMemberIds = group.members.map(member => member._id);
        const usersNotInGroup = await User.find({ _id: { $nin: groupMemberIds } });

        res.status(200).json({ users: usersNotInGroup });
    } catch (err) {
        return next(new HttpError('Fetching users failed, please try again later.', 500));
    }
};

const leaveGroup = async (req,res,next)=>{
    const {userId} = req.body;
    // console.log('here');
    try{
        // console.log('here');
        const group = await Group.findById(req.params.groupId);
        group.members = group.members.filter(member => !member._id.equals(userId));

        if (group.admin.equals(userId)) {
            if (group.members.length > 0) {
              group.admin = group.members[0]._id; // Assign new admin
            } else {
              group.admin = null; // Or delete the group if no members remain
            }
        }
        console.log('here');
        await group.save();
        return res.status(200).json({ message: 'Left group successfully' });
    }
    catch(error){
        return res.status(500).json({ error: 'Error leaving group' });
    }
}
module.exports = {
    createGroup,
    ViewGroups,
    addMember,
    removeMember,
    deleteGroup,
    getGroup,
    getUsersNotInGroup,
    leaveGroup
};
