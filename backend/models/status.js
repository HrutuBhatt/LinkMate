const { default: mongoose } = require("mongoose");


const userStatusSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});
  
const UserStatus = mongoose.model('UserStatus', userStatusSchema);
module.exports = UserStatus;