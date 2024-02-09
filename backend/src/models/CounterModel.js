const mongoose = require("mongoose")

const counterSchema = new mongoose.Schema({
    type: {type:String, required: true},   // "purchase_history_id", "book_id"
    value: {type:Number, default:0}
},{ timestamps: true })

const Counter = mongoose.model("Counter", counterSchema);

module.exports = Counter;