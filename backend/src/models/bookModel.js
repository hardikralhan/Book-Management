const mongoose = require("mongoose")
const slugify = require('slugify');

const bookSchema = new mongoose.Schema({
    book_id: {type: String, required: true},
    authors: {type: [String], required: true},  // will contain author's user_id's 
    sell_count: {type: Number, default:0},
    description: {type: String},
    title: {type: String, unique: true},
    price: {type:Number, required:true, min:100, max: 1000},
    rating: {type:Number, min:0, max:5, default:0 } // 0 means no rating
}, { timestamps: true })

// Virtual field for generating slug based on the title
bookSchema.virtual('slug').get(function() {
    return slugify(this.title, { lower: true });
});

const Book = mongoose.model("Book", bookSchema);

module.exports = Book;