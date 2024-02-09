const mongoose = require("mongoose")

const tokenSchema = new mongoose.Schema({
    user_id: {type: String},
    token: {type: String},
    expiresAt: {type: Number}
}, {timestamps:true})

module.exports = mongoose.model("Token", tokenSchema);