const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    user_id: {type: String, required:true},
    name: { type: String, required: true},
    password: { type:String, required: true},
    email: { type:String, required: true, unique: true},
    role_id: { type: Number, enum: [1,2,3]},  // 1 author, 2 admin, 3 retail_user
    active: { type:Number, enum: [0,1], required:true },
    address: { type: String}
}, { timestamps: true });

const User = mongoose.model("User",userSchema)
module.exports = User;