const express = require("express")
const {
    auth
} = require('../middlewares/auth.js')
const {
    authorBooksController,
    authorPurchaseHistoryController,
    adminPurchaseHistoryController,
    buyBookController,
    userPurchaseHistoryController,
    searchByAuthorController,
    searchByTitleController
} = require("../controllers/userController.js")
const router = express()

router.post('/authorBooksList', [auth], authorBooksController)
router.post('/authorPurchaseHistory', [auth], authorPurchaseHistoryController)
router.get('/adminPurchaseHistory', [auth], adminPurchaseHistoryController)
router.post('/buyBook', [auth], buyBookController)
router.post('/userPurchaseHistory', [auth], userPurchaseHistoryController)
router.post('/searchByAuthor', [auth], searchByAuthorController)
router.post('/searchByTitle', [auth], searchByTitleController)

module.exports = router;