const {validationResult} = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/users');
const Message = require('../models/messages');

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}); 
    return res.status(200).json({ users }); 
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Fetching users failed, Error in user controller" });
  }
};

const getOneUser = async(req,res,next)=>{
  try {
    const userId = req.params.uid;
    const userone = await User.findById(userId); 
    // if (!userone) {
    //   return res.status(404).json({ message: 'User not found' });
    // }
    // console.log("here");
    return res.status(200).json({userone}); 
    // return res.status(200).json({ user: userone.toObject({ getters: true }) }); 
  } catch (err) {
    console.error("Error fetching single user:", err);
    res.status(500).json({ message: "Fetching one user failed, please try again later." });
  }
};

const signup = async(req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(422).json({message:'Invalid inputs apssed, please check your data',errors: errors.array()});
    }
    const {username, email, password} = req.body;
    console.log(username, email, password);
    
    try{
        let existingUser = await User.findOne({email:email});
        if(existingUser){
            return res.status(422).json({ message: 'User exists already, please login instead.' });
        }
        saltRounds = 12;
        let salt=null;
        bcrypt.genSalt(saltRounds, (err, salt) => {
          if (err) {
              // Handle error
              return;
          }
          console.log("salt = ", salt);
        });
        
        console.log("password = ", password);
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const createUser = new User({
            username,
            email,
            password: hashedPassword,
            friends:[],
        });
        await createUser.save();
        const token = jwt.sign(
            { userId: createUser.id, email: createUser.email },
            'supersecret_dont_share',
            { expiresIn: '1h' }
        );
        res.status(201).json({ userId: createUser.id, email: createUser.email, token:token});

    } catch(err){
        console.error(err);  
        res.status(500).json({ message: 'Signing up failed, please try again later.' });
    }
};

const login = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email: email });

        if (!existingUser) {
            return res.status(403).json({ message: 'Invalid credentials, could not log you in.' });
        }

        const isValidPassword = await bcrypt.compare(password, existingUser.password);

        if (!isValidPassword) {
            return res.status(403).json({ message: 'Invalid credentials, could not log you in.' });
        }

        const token = jwt.sign(
            { userId: existingUser.id, email: existingUser.email },
            'supersecret_dont_share',
            { expiresIn: '1h' }
        );

        res.json({ token, userId: existingUser.id, email: existingUser.email });
        // res.json({message:'login successful' });
    } catch (err) {
        res.status(500).json({ message: 'Logging in failed, please try again later.' });
    }
};

// Change Username
const changeUsername = async (req, res, next) => {
    const { uid } = req.params;
    const { newUsername } = req.body;
  
    let user;
    try {
      user = await User.findById(uid);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      user.username = newUsername;
      await user.save();
      res.status(200).json({ message: 'Username updated successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Updating username failed' });
    }
  };
  
// Change Password
const changePassword = async (req, res, next) => {
    const { uid } = req.params;
    const { currentPassword, newPassword } = req.body;
  
    let user;
    try {
      user = await User.findById(uid);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(403).json({ message: 'Current password is incorrect' });
      }
  
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      user.password = hashedPassword;
      await user.save();
      res.status(200).json({ message: 'Password updated successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Updating password failed' });
    }
};

const searchUsers = async (req, res, next) => {
  // const { searchTerm } = req.query; // Get search term from query string
  const searchTerm = String(req.query.searchTerm || '');
  try {
    const users = await User.find({
      username: { $regex: searchTerm, $options: 'i' }
    });

    res.status(200).json({ users });
  } catch (err) {
    console.error("Error searching users:", err);
    res.status(500).json({ message: "Searching users failed, please try again later." });
  }
};

// src/controllers/userController.js


const updateUserProfile = async (req, res, next) => {
  const userId = req.params.userId; 
  const { username, bio, profilePic } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { username, bio, profilePic },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ user: updatedUser });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ message: 'Profile update failed, please try again later.' });
  }
};

const getChatList = async(req,res)=>{
  try{
    const {userId} = req.params;
    const user = await User.findById(userId).populate('recent.friendId', '_id username');

    if(!user){
      return res.status(404).json({message:"User not found"});
    }

    const sortedRecentChats = user.recent.sort((a,b)=> new Date(b.timestamp) - new Date(a.timestamp));
    return res.status(200).json({users: sortedRecentChats});

  }
  catch(error){
    res.status(500).json({message: 'Some error occured'});
  }
};



module.exports = {
    signup,
    login,
    changeUsername,
    changePassword,
    getUsers ,
    searchUsers,
    updateUserProfile,
    getOneUser,
    getChatList
};