const mongoose = require("mongoose")
const moment = require("moment")

const purchaseHistorySchema = new mongoose.Schema({
    purchase_history_id: {type:String, required: true},
    book_id: {type:String, required: true},    // which has been purchased
    user_id: {type:String, required: true},    // which user has purchased the book
    purchase_date: {type:String, default: moment().toLocaleString()},
    price: {type:Number, required: true},
    quantity: {type:Number, required: true}
},{ timestamps: true })

const PurchaseHistory = mongoose.model("PurchaseHistory", purchaseHistorySchema);

module.exports = PurchaseHistory;