const Book = require("../models/bookModel")
const User = require("../models/userModel")
const {
    book_counter
} = require("../middlewares/counterIncrement")
const {
    sendMail
} = require("../middlewares/mailComposer")
const MAIL_TYPE = require("../constants/emailType")

const addBookService = async (author_user_ids, title, description, price) => {

    let bookObj = {
        book_id: await book_counter(),
        description: description,
        title: title,
        price: price,
        authors: author_user_ids // user_id's will be in array
    }

    let bookData = await new Book(bookObj);
    await bookData.save()

    // send mail to retail user of release of new book
    // get all retail users
    let user_aggregate = [
        {
            $match:{
                active:1,
                role_id:3
            }
        },
        {
            $project:{
                user_id: 1,
                name:1,
                email:1
            }
        }
    ]
    let user_details = await User.aggregate(user_aggregate)
    for(user of user_details){
        await sendMail(user.email,MAIL_TYPE.NEW_RELEASE_BOOK,bookObj)
    }
    return;
}

module.exports = {
    addBookService
}