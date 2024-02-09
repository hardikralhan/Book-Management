const Book = require("../models/bookModel")
const User = require("../models/userModel.js")
const STATUS = require("../constants/status.js")
const ERRORCODE = require("../constants/errorcode.js")
const {
    authorBooksService,
    authorPurchaseHistoryService,
    adminPurchaseHistoryBookRevenueService,
    buyBookService,
    userPurchaseHistoryService
} = require("../services/userServices.js")

const authorBooksController = async (req, res) => {
    try {
        let author_user_id = req.body.author_user_id
        let result = await authorBooksService(author_user_id)
        return res.status(STATUS.OK).send({
            result
        })
    } catch (error) {
        console.log(error)
        return res.status(STATUS.BAD_REQUEST).send(`{"errorCode":"ERR0000", "error":"${ERRORCODE.ERR0000}"}`);
    }
}

const authorPurchaseHistoryController = async (req, res) => {
    try {
        let author_user_id = req.body.author_user_id
        let result = await authorPurchaseHistoryService(author_user_id)
        return res.status(STATUS.OK).send({
            result
        })
    } catch (error) {
        console.log(error)
        return res.status(STATUS.BAD_REQUEST).send(`{"errorCode":"ERR0000", "error":"${ERRORCODE.ERR0000}"}`);
    }
}

const adminPurchaseHistoryController = async (req, res) => {
    try {
        let [total_price_array, user_purchase_history_array] = await adminPurchaseHistoryBookRevenueService()
        return res.status(STATUS.OK).send({
            total_price_array,
            user_purchase_history_array
        })
    } catch (error) {
        console.log(error)
        return res.status(STATUS.BAD_REQUEST).send(`{"errorCode":"ERR0000", "error":"${ERRORCODE.ERR0000}"}`);
    }
}

const buyBookController = async (req, res) => {
    try {
        let {
            book_id,
            user_id,
            price,
            quantity
        } = req.body
        await buyBookService(book_id, user_id, price, quantity)
        return res.status(STATUS.OK).send({
            msg: "book bought successfully"
        })
    } catch (error) {
        console.log(error)
        return res.status(STATUS.BAD_REQUEST).send(`{"errorCode":"ERR0000", "error":"${ERRORCODE.ERR0000}"}`);
    }
}

const userPurchaseHistoryController = async (req, res) => {
    try {
        let retail_user_id = req.body.retail_user_id
        let result = await userPurchaseHistoryService(retail_user_id)
        return res.status(STATUS.OK).send({
            result
        })
    } catch (error) {
        console.log(error)
        return res.status(STATUS.BAD_REQUEST).send(`{"errorCode":"ERR0000", "error":"${ERRORCODE.ERR0000}"}`);
    }
}

const searchByAuthorController = async (req, res) => {
    try {
        let author_name = req.body.author_name

        let user_aggregate = [{
                $match: {
                    name: {
                        $regex: new RegExp(`^${author_name}$`, "i")
                    },
                    role_id: 1 // author role
                }
            },
            {
                $project: {
                    _id: 0,
                    name: 1,
                    user_id: 1
                }
            }
        ]
        let author_details = await User.aggregate(user_aggregate)

        // getting author's books
        for (author of author_details) {
            let user_book_aggregate = [{
                    $match: {
                        authors: author.user_id
                    }
                },
                {
                    $project: {
                        _id: 0,
                        book_id: 1,
                        title: 1
                    }
                }
            ]
            let author_books = await Book.aggregate(user_book_aggregate)
            author.books = author_books
            // console.log(author_books);
        }
        return res.status(STATUS.OK).send({
            author_details
        });
    } catch (error) {
        console.log(error)
        return res.status(STATUS.BAD_REQUEST).send(`{"errorCode":"ERR0000", "error":"${ERRORCODE.ERR0000}"}`);
    }
}

const searchByTitleController = async (req, res) => {
    try {
        let title = req.body.title

        let book_aggregate = [{
                $match: {
                    title: {
                        $regex: new RegExp(`${title}$`, "i")
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    book_id: 1,
                    title: 1,
                    price: 1,
                    description: 1,
                    rating: 1
                }
            }
        ]
        let book_details = await Book.aggregate(book_aggregate)
        return res.status(STATUS.OK).send({
            book_details
        });
    } catch (error) {
        console.log(error)
        return res.status(STATUS.BAD_REQUEST).send(`{"errorCode":"ERR0000", "error":"${ERRORCODE.ERR0000}"}`);
    }
}

module.exports = {
    authorBooksController,
    authorPurchaseHistoryController,
    adminPurchaseHistoryController,
    buyBookController,
    userPurchaseHistoryController,
    searchByAuthorController,
    searchByTitleController
}