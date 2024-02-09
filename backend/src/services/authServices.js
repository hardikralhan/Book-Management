const {
    comparePassword,
    encryptPassword
} = require("../helpers/passwordEncryption/passwordEncryption.js")
var mongoose = require('mongoose');
const User = require("../models/userModel.js")
const jwt = require("jsonwebtoken")
const Token = require("../models/tokenModel.js")
const {
    APIError,
    HttpStatusCode
} = require("../exception/errorHandler.js")
const { v4: uuidv4 } = require("uuid")


const userLoginService = async (email, password) => {
    try {

        //#region User Pipeline
        let userPipeline = [{
                $project: {
                    user_id: "$user_id",
                    email: {
                        $toLower: '$email'
                    },
                    active: '$active',
                    password: '$password',
                    name: '$name'
                }
            },
            {
                $match: {
                    email: email
                }
            }
        ]
        //#endregion

        let result = await User.aggregate(userPipeline)

        let userDetails = result[0]

        let hashedPassword = userDetails.password

        let isPasswordMatched = await comparePassword(password, hashedPassword)

        // to be deleted once registration is done
        // isPasswordMatched = true;
        if (isPasswordMatched) {

            // getting Token of User
            let tokenObj = await getTokenOfUserService(userDetails.user_id)

            if (tokenObj == null || new Date().getTime() > tokenObj.expiresAt) {
                await generateTokenService(userDetails.user_id)
                // getting Token of User
                tokenObj = await getTokenOfUserService(userDetails.user_id)
            }
            return {
                token: tokenObj.token,
                expiresAt: tokenObj.expiresAt,
                userName: userDetails.name,
                user_id: userDetails.user_id
            }
        } else {
            // Return Error Message Because Password Does Not Matched
            return new APIError("BAD_INPUT", HttpStatusCode.BAD_INPUT, true, 'Wrong Password.')
        }

    } catch (error) {
        console.log(error);
        throw new APIError(error.name, error.httpCode, error.isOperational, error.message);
    }
}

const generateTokenService = async (user_id) => {
    try {

        //generate new token
        let jwtSecretKey = process.env.JWT_SECRET_KEY;
        let generatedTime = new Date().getTime()
        let tokenExpiryTime = generatedTime + 24 * 60 * 60 * 1000 // Token Expires In 1 Day

        let data = {
            user_id: user_id,
            tokenExpiryTime: tokenExpiryTime
        }

        const token = jwt.sign(data, jwtSecretKey);

        // Deleting Previous Token
        await Token.findOneAndDelete({
            user_id: user_id
        })

        // Creating Token Object To Store In DB
        let tokenObject = {
            user_id: user_id,
            token: token,
            expiresAt: tokenExpiryTime
        }
        let tokenData = await Token.create(tokenObject)
        await tokenData.save()

        // Resolve Promise
        return Promise.resolve()
    } catch (error) {
        console.log(error);
        throw new APIError(error.name, error.httpCode, error.isOperational, error.message);
    }
}

//#region Get Token Of User
const getTokenOfUserService = async (user_id) => {
    try {

        //#region Token Pipeline
        let tokenPipeline = [{
            $match: {
                user_id: user_id
            }
        }]
        //#endregion

        let res = await Token.aggregate(tokenPipeline)
        if (res.length > 0) {
            return res[0]
        } else {
            return null
        }

    } catch (error) {
        console.log(error);
        throw new APIError(error.name, error.httpCode, error.isOperational, error.message);
    }
}

const userSignUpService = async (name, email, password, role_id, address) => {
    try {

        // Hashing Password
        password = await encryptPassword(password)

        let userObject = {
            user_id: uuidv4(),
            name: name,
            email: email,
            password: password,
            active: 1, // active
            address: address,
            role_id: role_id   // 1 author, 2 admin, 3 retail_user
        }

        let user = await User.create(userObject)
        await user.save();
        return;
    } catch (error) {
        console.log(error);
        throw new APIError(error.name, error.httpCode, error.isOperational, error.message);
    }
}

module.exports = {
    userLoginService,
    generateTokenService,
    getTokenOfUserService,
    userSignUpService,
}