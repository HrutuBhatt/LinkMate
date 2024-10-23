const mongoose = require('mongoose');
//const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;
const userSchema = new Schema({
    username: {type:String, unique:true, required:true},
    password: {type:String, required:true},
    email: {type:String, unique: true, required:true},
    profilePic: {type:String , default:'./defaultpic.jpg'},
    bio: {type: String, default:'Hey there! I am using Linkmate!'},
    createdAt: {type:Date, default:Date.now},
    recent: [{
        friendId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        timestamp: { type: Date, default: Date.now }
    }],
    unreadMessages: [{ 
        senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
        count: { type: Number, default: 0 } 
      }],
});

const User = mongoose.model('User',userSchema);
module.exports = User;  