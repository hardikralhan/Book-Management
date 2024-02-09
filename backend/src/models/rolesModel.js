const mongoose = require("mongoose")

const rolesSchema = new mongoose.Schema({
    role_id: {type:Number, required: true},
    role_name: {type:String, required: true},
    active: {type:Number, enum:[0,1], required:true}
},{ timestamps: true })

const Roles = mongoose.model("Roles", rolesSchema);

module.exports = Roles;