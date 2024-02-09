const User = require("../models/userModel.js");
const {
    userLoginService,
    userSignUpService,
} = require("../services/authServices.js");
const STATUS = require("../constants/status.js")
const ERRORCODE = require("../constants/errorcode.js")

const userLoginController = async (req, res, next) => {
    try {
        let {
            email,
            password
        } = req.body

        if (email == undefined || password == undefined) {
            return res.status(STATUS.BAD_REQUEST).send(`{"errorCode":"USREG0005", "error":"${ERRORCODE.USREG0005}"}`);
        }

        //#region User Pipeline
        let userPipeline = [{
                $project: {
                    user_id: '$user_id',
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
                    email: email.toLowerCase()
                }
            }
        ]
        //#endregion

        let userData = await User.aggregate(userPipeline)
        if (userData.length == 0) {
            // Reject Promise If User Has Not Been Found.
            return res.status(STATUS.BAD_REQUEST).send(`{"errorCode":"ERRORCODE", "error":"${ERRORCODE.USREG0000}"}`);
        }

        const result = await userLoginService(email.toLowerCase(), password)

        if (result.httpCode == 422) {
            return res.status(STATUS.BAD_INPUT).send(`{"errorCode":"USREG0009", "error":"${ERRORCODE.USREG0009}"}`);
        }

        return res.status(200).json({
            msg: 'Success',
            result
        })
    } catch (error) {
        next(error)
    }
}

const userSignupController = async (req, res, next) => {
    try {
        let {
            name,
            email,
            password,
            role_id,
            address
        } = req.body;

        if (name == undefined || email == undefined || password == undefined || role_id == undefined) {
            return res.status(STATUS.BAD_REQUEST).send(`{"errorCode":"USREG0005", "error":"${ERRORCODE.USREG0005}"}`);
        }

        const aggregate = [{
            $match: {
                email: email
            }
        }]
        const userExists = await User.aggregate(aggregate);

        if (userExists.length != 0) {
            return res.status(STATUS.BAD_REQUEST).send(`{"errorCode":"USREG0004", "error":"${ERRORCODE.USREG0004}"}`);
        }

        if(address == undefined) address = ""
        const result = await userSignUpService(name, email.toLowerCase(), password, role_id, address);

        return res.status(200).send('Successfully Signed Up');
    } catch (error) {
        next(error)
    }
}

module.exports = {
    userLoginController,
    userSignupController,
};