const mongoose = require("mongoose")

const bookReviewSchema = new mongoose.Schema({
    book_review_id: {type:Number, required: true},
    book_id: {type:String, required: true},    // which book has reviewed
    user_id: {type:String, required: true},    // which user has reviewed the book
    review_date: {type:String, default: moment().toLocaleString()},
    review: {type:String, required: true},
},{ timestamps: true })

const BookReview = mongoose.model("BookReview", bookReviewSchema);

module.exports = BookReview;