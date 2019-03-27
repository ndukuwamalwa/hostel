const Validator = require('node-input-validator');
const bcrypt = require('bcryptjs');

const User = require('../model/user');

const PATH_TO_VIEW = 'portal/index';

exports.getAddUser = (req, res) => {
    res.status(200).render(PATH_TO_VIEW, {
        title: 'New user',
        page: '../user/add.ejs',
        action: '/users',
        method: 'POST',
        formTitle: 'Add user',
        errors: {
            type: req.flash('type'),
            message: req.flash('message')
        }
    });
};
exports.postAdd = (req, res) => {
    const body = req.body;
    const validator = new Validator(body, {
        email: 'required|email',
        password: 'required'
    });
    validator.check()
    .then(matched => {
        if (matched) {
            bcrypt.hash(body.password, 12)
            .then(hashedPassword => {
                const user = new User(body.email, hashedPassword, '1', req.session.user || '');
                user.save()
                .then(() => {
                    req.flash('type', 'success');
                    req.flash('message', 'User added successfully.');
                    res.redirect('/users');
                })
                .catch(err => {
                    req.flash('type', 'error');
                    if (err.sqlState === "23000") {
                        req.flash('message', 'Email address has already been used.');
                    } else {
                        req.flash('message', 'Unable to save user.');
                    }
                    res.redirect('/users');
                });
            })
            .catch(() => {
                req.flash('type', 'errors');
                req.flash('message', 'A server problem occured. Please retry or contact developers.');
                res.redirect('/users');
            });
        } else {
            res.status(422).send(`User input error. Please complete all required fields.`);
        }
    })
    .catch((err) => {
        res.status(500).send(`Server error occured.`);
    });
};
exports.changePassword = (req, res) => {
    const body = req.body;
    const validator = new Validator(body, {
        password: 'required|password',
    });
    validator.check()
    .then(matched => {
        if (matched) {

        } else {
            res.status(422).send();
        }
    })
    .catch(() => {
        res.status(500).send();
    });
};
exports.delete = (req, res) => {
    if (!req.query.id) {
        req.flash('type', 'error');
        req.flash('message', 'Url input error.')
        return res.redirect('/users/search');
    }
    if (req.query.id === req.session.user) {
        req.flash('type', 'error');
        req.flash('message', 'You cannot delete the user that is currently logged in.');
        return res.redirect('/users/search');
    }
    User.delete(req.query.id)
    .then(data => {
        req.flash('type', 'success');
        req.flash('message', 'Delete operation was successfull.');
        return res.redirect('/users/search');
    })
    .catch(() => {
        req.flash('type', 'error');
        req.flash('message', 'Server error.');
        return res.redirect('/users/search');
    });
};
exports.view = (req, res) => {
    if (!req.query.id) {
        req.flash('type', 'error');
        req.flash('message', 'Url input error.');
        return res.redirect('/users/search');
    }
    User.view(req.query.id)
    .then(data => {
        let user = data[0];
        res.render(PATH_TO_VIEW, {
            title: 'Viewing user',
            page: '../user/view.ejs',
            user
        });
    })
    .catch(() => {
        req.flash('type', 'error');
        req.flash('message', 'Server error.');
        return res.redirect('/users/search');
    });
};
exports.viewAll = (req, res) => {
    User.viewAll()
    .then(data => {
        const results = data[0];
        for (let result of results) {
            result.visibles = [{
                key: `Email`,
                text: result.email
            }, {
                key: `Date created`,
                text: result.created
            }];
            result.actions = [{
                href: '/users/view?id='+result.email,
                text: 'View'
            },{
                href: '/users/delete?id='+result.email,
                text: 'Delete'
            }];
        }
        res.render(PATH_TO_VIEW, {
            title: 'Viewing users',
            page: '../shared/search-results.ejs',
            results
        });
    })
    .catch(() => {
        req.flash('type', 'error');
        req.flash('message', 'Server error.');
        return res.redirect('/users/search');
    });
};
exports.getSearch = (req, res) => {
    res.render(PATH_TO_VIEW, {
        title: 'Search user',
        formTitle: 'Search user',
        method: 'POST',
        action: '/users/search',
        page: '../user/search',
        errors: {
            type: req.flash('type'),
            message: req.flash('message')
        }
    });
};
exports.postSearch = (req, res) => {
    if (!req.body.keyword) {
        req.flash('type', 'error');
        req.flash('message', 'Provide a search keyword.');
        return res.redirect('/booking/search');
    }
    User.search(req.body.keyword)
    .then(data => {
        const results = data[0];
        for (let result of results) {
            result.visibles = [{
                key: `Email`,
                text: result.email
            }, {
                key: `Date created`,
                text: result.created
            }];
            result.actions = [{
                href: '/users/view?id='+result.email,
                text: 'View'
            },{
                href: '/users/delete?id='+result.email,
                text: 'Delete'
            }];
        }
        res.render(PATH_TO_VIEW, {
            page: '../shared/search-results.ejs',
            title: `Search results for: ${req.body.keyword}`,
            results
        });
    })
    .catch(() => {
        req.flash('type', 'error');
        req.flash('message', 'Server error.');
        return res.redirect('/users/search');
    });
};