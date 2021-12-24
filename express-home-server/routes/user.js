const express = require('express');
const bcrypt = require('bcrypt');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid'); 

const db = require('../database/db.json');
const authenticate = require('../middleware/authenticate');

const generatorJWT = require('../utils/generateJWT');

const router = express.Router();

// function for fs
const writeFs = (ruta, body, cb) => {
    fs.writeFile(ruta, body, error => {
       if (error) {
        cb(error.message)
       }
    })
};

// pruba de cookie
router.get('/cookie', (req, res)=> {
    console.log('yeah!!')
    console.log(req.cookies)
    res.status(200).send(`the server is listening ${JSON.stringify(req.cookies)}`)
    // res.clearCookie('cookie')
})

// end point 

// add a new user
router.post('/sign-up', async (req, res) => {
    const {name, email, password} = req.body;
    
    try {
        const userName = db.find(user => user.name === name);
        const userEmail = db.find(user => user.email === email);

        if(userName || userEmail) {
            return res.status(400).send({messageError: 'The user or email exists', isAuthenticated: false})
        }

        const salt = await bcrypt.genSalt(10);
        const bcryptPassword = await bcrypt.hash(password, salt);

        let newUser = {
            "id": uuidv4(), 
            "name": name,
            "email": email,
            "password": bcryptPassword
        }

        db.push(newUser);
        writeFs('database/db.json', JSON.stringify(db, null, 2), console.error)

        // genating a JWT

        const jwtToken = generatorJWT(newUser.id)
        console.log(`hola${jwtToken}`)

        return res.status(201).send({jwtToken, isAuthenticated: true })

    } catch (error) {
        console.error(error)
        res.status(500).send({error: error.message})
    }
    
});

router.get('/jwt', (req,res)=> {

    res.status(200).json({count: req.session.count});
})

//log in an existing user
router.post('/sign-in',async (req, res)=> {
    const {email, password} = req.body;
    try {
        // check if user exists
        const user = db.find(user => user.email === email)
        if(!user) {
            return res.status(401).send({messageError: 'user is not registered', isAuthenticated: false});
        }

        // check if the password is valid
        const isValidPassword = await bcrypt.compare(password, user.password);
        if(!isValidPassword) {
            return res.status(401).send({messageError: 'Invalid password', isAuthenticated: false});
        }

        // it is created JWT
        const JWT = generatorJWT(user.id)
        // console.log(JWT)

        // return res.clearCookie('jwt').cookie('jwt', JWT, {
        //     maxAge: 1000 * 30,
        //     httpOnly: true
        // }).status(200).send({jwtToken:JWT, isAuthenticated: true, cookie: req.cookies})
        req.session.count = JWT;
        console.log(req.session)
        // return res.status(200).json({jwr: req.session.count})
        return res.status(200).send({jwtToken:JWT, isAuthenticated: true,})
    } catch (error) {
        console.error(error);
        res.status(500).send({error: error.message})
    }
})

// router.get('/home', authenticate, (req, res)=> {
//     res.status(200).send('')
// })
router.get('/name', authenticate, (req,res)=> {
    let user = db.find(obj => obj.id === req.user.id);
    res.status(200).send({userName: user.name});
})

module.exports = router;

