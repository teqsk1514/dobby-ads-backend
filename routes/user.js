const express = require('express');
const router = express.Router();

const User = require('../models/user');
const keys = require('../config/keys')

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');



// load the validation file
const validateRegisterInput = require('../validation/register');
const validateLoginInput = require('../validation/login');


router.get('/login', (req, res) => {
    res.json({ msg: 'login route' })
})

// @route   POST user/login
// @desc    login the user
// @access  Public
router.post('/login', (req, res) => {
    console.log(req.body);
    const { errors, isValid } = validateLoginInput(req.body);


    // Check Validation
    if (!isValid) {
        return res.status(400).json(errors);
    }

    const email = req.body.email;
    const password = req.body.password;

    // console.log(email, password);

    // find the user as per request
    User.findOne({ where: { email: email } })
        .then(user => {
            if (!user) {
                errors.email = 'User not found';
                return res.status(400).json(errors);
            }

            bcrypt
                .compare(password, user.password)
                .then(isMatch => {
                    if (isMatch) {
                        const payload = { id: user.id, name: user.name, email: user.email };
                        jwt.sign(
                            payload,
                            keys.secretOrkey,
                            { expiresIn: 3600 },
                            (err, token) => {
                                if (err) {
                                    return res.json(err);
                                }
                                res.json({
                                    success: true,
                                    token: 'Bearer ' + token
                                })
                            });

                    } else {
                        errors.password = 'Password Incorrect'
                        return res.status(400).json(errors);
                    }
                })
                .catch(err => {
                    console.log(err);
                });
        })
        .catch(err => {
            console.log(err);
        });
});

// @route   GET user/current
// @desc    return current user
// @access  private
router.get('/current', passport.authenticate('jwt', { session: false }), (req, res) => {
    const user = req.user;
    res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        date: user.date
    });
});


// @route   POST user/register
// @desc    Register the user
// @access  Public
router.post('/register', (req, res) => {
    const { errors, isValid } = validateRegisterInput(req.body);
    // Check Validation
    if (!isValid) {
        return res.status(400).json(errors);
    } else {
        User.findOne({
            where: {
                email: req.body.email
            }
        })
            .then(user => {
                if (user) {
                    // console.log(user);
                    errors.email = 'User Alredy Exist';
                    return res.status(404).json(errors);
                } else {
                    const newUser = {
                        name: req.body.name,
                        email: req.body.email,
                        password: bcrypt.hashSync(req.body.password, 8),
                    }
                    User
                        .create(newUser)
                        .then(user => {
                            // console.log(user);
                            res.json(user);
                        })
                        .catch();
                }
            })
            .catch(err => {
                console.log(err);
            });
    }

})


module.exports = router;