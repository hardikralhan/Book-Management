const express = require("express")
const mongoose = require("mongoose")
const dotenv = require("dotenv")
const authRoutes = require("./src/routes/authRoutes")
const bookRoutes = require("./src/routes/bookRoutes")
const userRoutes = require("./src/routes/userRoutes")

const app = express()
app.use(express.json())
const PORT = 5000

dotenv.config({ silent: process.env.NODE_ENV === 'production' })
mongoose.connect(process.env.MONGO_CONNECTION)
.then(()=>{
    console.log('mongoose Connected successfully');
})
.catch((err)=>{
    console.log(err)
})

app.use('/api/auth',authRoutes)
app.use('/api/book',bookRoutes)
app.use('/api/user',userRoutes)
app.get("/",(req,res)=>{
    res.send("start")
})

app.listen(PORT,()=>{
    console.log(`server started at port ${PORT}`);
})

module.exports = app;