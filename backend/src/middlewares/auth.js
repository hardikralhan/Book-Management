const jwt = require("jsonwebtoken")
const mongoose = require("mongoose")
const STATUS = require("../constants/status")
const ERRORCODE = require("../constants/errorcode.js")

const auth = async (req,res,next) =>{
    try {
        const token = req.headers['authorization']
        if(!token){
            return res.status(STATUS.UNAUTHORIZED).send(`{"errorCode":"USREG0006", "error":"${ERRORCODE.USREG0006}"}`)
        }
        const verify = jwt.verify(token, process.env.JWT_SECRET_KEY)
        if(new Date().getTime() > verify.tokenExpiryTime){
            return res.status(STATUS.UNAUTHORIZED).send(`{"errorCode":"USREG0007", "error":"${ERRORCODE.USREG0007}"}`);
        }
        const user_id = verify.user_id;
        req.body.user_id = user_id
        next()
    } catch (error) {
        next(error)
    }
}

module.exports = {auth}