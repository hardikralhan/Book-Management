const mongoose = require("mongoose")

const RevenueSchema = new mongoose.Schema({
    user_id: {type: String, required:true},  // whose total revenue is it
    role_id: { type: Number, enum: [1,2,3]},  // 1 author, 2 admin, 3 retail_user
    total_revenue: {type: Number}
}, { timestamps: true });

const Revenue = mongoose.model("Revenue",RevenueSchema)
module.exports = Revenue;