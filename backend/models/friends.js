const mongoose = require('mongoose');

const friendshipSchema = new mongoose.Schema({
    user1: {type: mongoose.Schema.Types.ObjectId, ref:'User', required:true},
    user2: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }
});

const Friend = mongoose.model('Friend', friendshipSchema);
module.exports = Friend;
