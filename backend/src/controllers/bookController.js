const Book = require("../models/bookModel")
const STATUS = require("../constants/status.js")
const ERRORCODE = require("../constants/errorcode.js")
const {addBookService} = require("../services/bookServices.js")

const addBookController = async (req,res) =>{
    try {
        let {author_user_ids,title,description,price} = req.body
        title = title.toLowerCase()
        if(price<100 || price>1000){
            return res.status(STATUS.BAD_INPUT).send(`{"errorCode":"BOOK0000", "error":"${ERRORCODE.BOOK0000}"}`);
        }
        let bookTitleExists = await Book.find({title:title});
        if(bookTitleExists != 0){
            return res.status(STATUS.BAD_INPUT).send(`{"errorCode":"BOOK0001", "error":"${ERRORCODE.BOOK0001}"}`);
        }

        await addBookService(author_user_ids,title,description,price)
        return res.status(STATUS.CREATED).send({
            msg: "Book added sucsessfully"
        })
    } catch (error) {
        console.log(error)
        return res.status(STATUS.BAD_REQUEST).send(`{"errorCode":"ERR0000", "error":"${ERRORCODE.ERR0000}"}`);
    }
}

module.exports = {
    addBookController
}