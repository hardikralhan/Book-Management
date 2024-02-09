const Book = require("../models/bookModel")
const User = require("../models/userModel")
const Revenue = require("../models/RevenueGeneratedModel.js")
const PurchaseHistory = require("../models/purchaseHistoryModel")
const {
    purchase_history_counter
} = require("../middlewares/counterIncrement")
const {
    sendMail,
    run_queue
} = require("../middlewares/mailComposer")
const MAIL_TYPE = require("../constants/emailType.js")
const moment = require("moment")

const authorBooksService = async (author_user_id) => {
    try {
        let aggregate = [{
                $match: {
                    $expr: {
                        $in: [author_user_id, "$authors"]
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    book_id: 1,
                    sell_count: 1,
                    description: 1,
                    title: 1,
                    price: 1,
                    rating: 1
                }
            }
        ]
        let result = await Book.aggregate(aggregate);
        return result
    } catch (error) {
        console.log(error)
        return error
    }
}

const authorPurchaseHistoryService = async (author_user_id) => {
    try {
        let author_books_list = await authorBooksService(author_user_id)

        let result = []
        for (book of author_books_list) {
            let book_obj = {}
            let aggregate = [{
                    $match: {
                        book_id: book.book_id
                    }
                },
                {
                    $group: {
                        _id: null,
                        total_price: {
                            $sum: "$price"
                        }
                    }
                }
            ]
            let purchase_result = await PurchaseHistory.aggregate(aggregate);

            let total_price
            purchase_result.length == 0 ? total_price = 0 : total_price = purchase_result[0].total_price

            if (!book_obj.title) {
                book_obj[book.title] = {
                    // total sell count of that book
                    sell_count: book.sell_count,
                    // revenue generated (price of book added)
                    revenue_generated: total_price
                }
            }
            result.push(book_obj)
        }

        return result
    } catch (error) {
        console.log(error)
        return error
    }
}

const adminPurchaseHistoryBookRevenueService = async () => {
    try {
        let books_list = await Book.find()

        let result = []
        for (book of books_list) {
            let book_obj = {}
            let aggregate = [{
                    $match: {
                        book_id: book._doc.book_id
                    }
                },
                {
                    $group: {
                        _id: null,
                        total_price: {
                            $sum: "$price"
                        }
                    }
                }
            ]
            let purchase_total_price_result = await PurchaseHistory.aggregate(aggregate);

            let total_price
            purchase_total_price_result.length == 0 ? total_price = 0 : total_price = purchase_total_price_result[0].total_price
            if (!book_obj.title) {
                book_obj[book._doc.title] = {
                    // total sell count of that book
                    sell_count: book.sell_count,
                    // revenue generated (price of book added)
                    revenue_generated: total_price
                }
            }
            result.push(book_obj)
        }
        let purchase_user_result = await adminPurchaseHistoryService(books_list)

        return [result, purchase_user_result]
    } catch (error) {
        console.log(error)
        return error
    }
}

const adminPurchaseHistoryService = async (books_list) => {
    try {

        let result = []
        for (book of books_list) {
            let book_obj = {}
            let aggregate = [{
                $match: {
                    book_id: book._doc.book_id
                },
            }, {
                $project: {
                    _id: 0
                }
            }]
            let purchase_result = await PurchaseHistory.aggregate(aggregate);

            if (!book_obj[book._doc.title]) {
                book_obj[book._doc.title] = []
            }
            book_obj[book._doc.title].push(purchase_result)
            result.push(book_obj)
        }

        return result
    } catch (error) {
        console.log(error)
        return error
    }
}

const buyBookService = async (book_id, user_id, price, quantity) => {
    try {
        // add in purchase history
        let purchase_obj = {
            purchase_history_id: await purchase_history_counter(),
            book_id: book_id,
            user_id: user_id,
            price: price,
            quantity: quantity
        }
        let purchase = await PurchaseHistory.create(purchase_obj)
        await purchase.save()
        // increase sell count from book table
        let book_aggregate = [{
            $match: {
                book_id: book_id
            }
        }]
        let book_data = await Book.aggregate(book_aggregate);
        book_data = book_data[0]

        await Book.findOneAndUpdate({
            book_id: book_id
        }, {
            $set: {
                sell_count: book_data.sell_count + quantity
            }
        }, {
            new: true
        })

        // increasing total revenue of author
        // send mail to author whose book is purchased
        for (author of book_data.authors) {
            let past_revenue = await Revenue.findOne({
                user_id: author
            })

            // if didnt find create one else update revenue of author
            if (!past_revenue)(await Revenue.create({
                user_id: author,
                role_id: 1,
                total_revenue: price
            })).save()
            else {
                past_revenue = await Revenue.findOneAndUpdate({
                    user_id: author
                }, {
                    $set: {
                        total_revenue: past_revenue._doc.total_revenue + price
                    }
                }, {
                    new: true
                })
            }
            let sell_details = {
                title: book_data.title,
                price: book_data.price,
                quantity: quantity,
                total_revenue: past_revenue._doc.total_revenue,
                year: moment().format("YYYY"),
                month: moment().format("MM")
            }
            let author_user_data = await User.findOne({
                user_id: author
            })
            await sendMail(author_user_data._doc.email, MAIL_TYPE.BOOK_SOLD, sell_details)
        }
        await run_queue()
        return

    } catch (error) {
        console.log(error)
        return error
    }
}

const userPurchaseHistoryService = async (retail_user_id) => {
    try {
        let aggregate = [{
            $match: {
                user_id: retail_user_id
            }
        },{
            $project:{
                _id:0,
                book_id: 1,
                price: 1,
                purchase_date:1,
                quantity: 1
            }
        }]
        // all books that user has purchased
        let purchase_result = await PurchaseHistory.aggregate(aggregate);
        for (purchase of purchase_result) {
            let book_data = await Book.findOne({
                book_id: purchase.book_id
            })
            purchase.title = book_data._doc.title
            purchase.description = book_data._doc.description
            purchase.book_price = book_data._doc.price
            purchase.rating = book_data._doc.rating
        }
        return purchase_result

    } catch (error) {
        console.log(error)
        return error
    }
}

module.exports = {
    authorBooksService,
    authorPurchaseHistoryService,
    adminPurchaseHistoryBookRevenueService,
    adminPurchaseHistoryService,
    buyBookService,
    userPurchaseHistoryService
};