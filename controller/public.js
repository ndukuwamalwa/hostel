const Validator = require('node-input-validator');
const bcrypt = require('bcryptjs');
const User = require('../model/user');
const Mailer = require('nodemailer');

const MAIL_FROM = 'justinwamalwa3@gmail.com';

const transporter = Mailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'justinwamalwa3@gmail.com',
        pass: 'cotlkwdvqgoaktor'
    }
});

exports.getLogin = (req, res) => {
    if (req.session.isLoggedIn) {
        res.redirect('/booking');
    } else {
        res.render('public/login.ejs', {
            errors: {
                type: req.flash('type'),
                message: req.flash('message')
            }
        });
    }
};
exports.postLogin = (req, res) => {
    const body = req.body;
    const validator = new Validator(body, {
        username: 'required',
        password: 'required'
    });
    let toResetFirst = false;
    validator.check()
    .then(matched => {
        if (matched) {
            return User.login(body.username);
        } else {
            req.flash('type', 'errors');
            req.flash('message', 'Please complete all required fields.');
            res.redirect('/login');
            return [[]];
        }
    })
    .then(data => {
        const result = data[0];
        if (result.length > 0) {
            if (result[0].ready === 0) {
                toResetFirst = true;
                return User.checkToken(body.username);
            } else {
                return bcrypt.compare(body.password, result[0].password);
            }
        } else {
            return false;
        }
    })
    .then(data => {
        if (data !== true && data !== false) {
            if (data[0].length > 0) {
                return bcrypt.compare(body.password, data[0][0].token);
            } else {
                return false;
            }
        } else {
            let doMatch = data;
            if (doMatch) {
                req.session.user = body.username;
                req.session.isLoggedIn = true;
                return true;
            } else {
                return false;
            }
        }
    })
    .then(doMatch => {
        if (toResetFirst && doMatch) {
            req.session.user = body.username;
            req.session.isLoggedIn = true;
            return res.redirect('/reset-page');
        } else if(!toResetFirst && doMatch) {
            req.session.user = body.username;
            req.session.isLoggedIn = true;
            return res.redirect('/booking');
        } else {
            req.flash('type', 'errors');
            req.flash('message', 'Invalid username or password.');
            return res.redirect('/login');
        }
    })
    .catch(() => {
        req.flash('type', 'errors');
        req.flash('message', 'A server problem occured. Please retry or contact developers.');
        res.redirect('/login');
    });
};

exports.getReset = (req, res) => {
    res.render('public/reset.ejs', {
        errors: {
            type: req.flash('type'),
            message: req.flash('message')
        }
    });
};

exports.postReset = (req, res) => {
    const validator = new Validator(req.body, {
        username: 'required|email'
    });
    const username = req.body.username;
    let password;
    validator.check()
    .then(matched => {
        if (matched) {
            return User.view(username);
        } else {
            req.flash('message', 'User input error.');
            req.flash('type', 'err');
            res.redirect('/password-reset');
            return false;
        }
    })
    .then(data => {
        if (data !== false) {
            if (data[0].length === 0) {
                req.flash('message', 'No user found with that email address.');
                req.flash('type', 'err');
                res.redirect('/password-reset');
                return false;
            } else {
                password = Math.floor(Math.random() * 1000000);
                return bcrypt.hash(password.toString(), 12);
            }
        } else {
            return false;
        }
    })
    .then(hashedPassword => {
        if (hashedPassword !== false) {
            return User.saveToken(username, hashedPassword);
        } else {
            return false;
        }
    })
    .then((value) => {
        const mailOptions = {
            from: MAIL_FROM,
            to: username,
            subject: 'Password reset.',
            text: `We have received your request to change password. Please log in using: ${password} as the password then change immediately after login.`
        };
        if (value !== false) {
            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                    req.flash('message', 'Server problem, please retry');
                    req.flash('type', 'err');
                    res.redirect('/password-reset');
                } else {
                    req.flash('type', 'success');
                    req.flash('message', 'New password has been sent to your email address.');
                    res.redirect('/login');
                }
            }); 
        } else {
            req.flash('message', 'Server problem, please retry');
            req.flash('type', 'err');
            res.redirect('/password-reset');
        }
    })
    .catch(() => {
        req.flash('message', 'Server problem, please retry');
        req.flash('type', 'err');
        res.redirect('/password-reset');
    });
};

exports.getResetPassword = (req, res) => {
    res.render('public/reset-page.ejs', {
        errors: {
            type: req.flash('type'),
            message: req.flash('message')
        }
    });
};

exports.postResetPassword = (req, res) => {
    const validator = new Validator(req.body, {
        password: 'required',
        confirm: 'required'
    });
    const username = req.session.user;
    if (!username) {
        req.session.isLoggedIn = false;
        return res.redirect('/login');
    }
    let password = req.body.password;
    let confirm = req.body.confirm;
    validator.check()
    .then(matched => {
        if (matched) {
            if (password === confirm) {
                return true;
            } else {
                return false;
            }
        } else {
            req.flash('message', 'User input error.');
            req.flash('type', 'err');
            res.redirect('/password-reset');
            return false;
        }
    })
    .then(match => {
        if (match === true) {
            return bcrypt.hash(password, 12);
        } else {
            return false;
        }
    })
    .then(hashedPassword => {
        if (hashedPassword !== false) {
            return User.changePassword(username, hashedPassword);
        } else {
            return false;
        }
    })
    .then((state) => {
        if (state !== false) {
            return res.redirect('/booking');
        } else {
            req.flash('message', 'Passwords do not match.');
            req.flash('type', 'err');
            return res.redirect('/reset-page');
        }
    })
    .catch((err) => {
        console.log(err);
        req.flash('message', 'Server problem, please retry');
        req.flash('type', 'err');
        res.redirect('/reset-page');
    });
};

exports.logout = (req, res) => {
    req.session.user = null;
    req.session.isLoggedIn = false;
    res.redirect('/login');
};