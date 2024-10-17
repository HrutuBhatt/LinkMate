const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // For direct messages
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' }, // For group messages
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    media: { type: String },     // URL to any media attached to the message,
    unread: {type: Boolean, default: true}
});
  
const Message = mongoose.model('Message', messageSchema);
module.exports = Message;
  