// Importing module
const bcrypt = require('bcryptjs');

const encryptPassword = async (password) => {
    try {
        var salt = bcrypt.genSaltSync(10)
        var hash = bcrypt.hashSync(password, salt);
        return hash
    } catch (error) {
    }
}

const comparePassword = async (password, hashedPassword) => {
    try {
        const result = bcrypt.compare(password, hashedPassword)
        return result
    } catch (error) {
    }
}

module.exports = {encryptPassword,comparePassword};
