const jwt = require('jsonwebtoken');
require('dotenv').config();

const generatorJWT = user_id => {
    const payload = {
        user: {
            id:user_id
        }
    }
    return jwt.sign(payload, process.env.jwtSecret, {expiresIn: '1h'})
}

module.exports = generatorJWT;
 