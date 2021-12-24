const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const user = require('./routes/user');

app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: 'hola'
}));

app.use(cookieParser());
app.use(express.json());
app.use(cors());
app.use((req, res, next) => {
    console.log(`REQUEST RECEIVED!`);
    console.log(` URL: ${req.path}`);
    console.log(` PARAMS: ${JSON.stringify(req.params)}`);
    console.log(` BODY: ${JSON.stringify(req.body, null, 2)}`);
    next();
    }); 

app.get('/', (req, res)=> {
    req.session.count = req.session.count ? req.session.count +1 : 1;
    
    res.json({count: req.session.count}) 
})

app.use('/user', user)

const server = app.listen(process.env.PORT || 3001, ()=> {
    console.log(`server listen in port${server.address().port}  http://localhost:${server.address().port}`)
})