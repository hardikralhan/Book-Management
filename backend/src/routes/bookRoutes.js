const express = require("express")
const {
    addBookController
} = require("../controllers/bookController.js")
const {
    auth
} = require('../middlewares/auth.js')
const router = express()

router.post('/addBook', [auth], addBookController)

module.exports = router;