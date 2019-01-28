const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./util/database');
const passport = require('passport');
// const User = require('./models/user');
const app = express();


const indexRoutes = require('./routes/index');
const userRoutes = require('./routes/user');


// used for parsing the req.body 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// CORS config
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, application/json');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Initialize Passport
app.use(passport.initialize());

// Passport Config
require('./config/passport.js')(passport);

app.use('/user', userRoutes);
app.use(indexRoutes);

const PORT = process.env.PORT || 5000;

sequelize
    // .sync({ force: true })
    .sync()
    // .then(res => {
    //     return User.create({ name: 'ravi', email: 'ravi@gamil.com' });
    // })
    .then(res => {
        // console.log(res)
        console.log('Connected to mysql')
        app.listen(PORT, () => {
            console.log(`The server is Running on ${PORT}`);
        })
    })
    .catch(err => console.log(err));

