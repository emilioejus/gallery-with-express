const jwt = require('jsonwebtoken');
require('dotenv').config();
const user = require('../routes/user');

const authenticate = async (req, res, next) => {
    let token = await req.session.count;
    console.log(req.session)

    if(!token) {
        return res.status(403).send({message: req.session, isAutheticated: false})
    }
  
    // token = token.split(" ")[1];

    try {
        const verify = jwt.verify(token, process.env.jwtSecret)
        console.log(verify)

        req.user = verify.user;

        next();
    } catch (error) {
        res.status(401).send({message: 'token is not valid', isAutheticated: false});
    }
};

module.exports = authenticate;