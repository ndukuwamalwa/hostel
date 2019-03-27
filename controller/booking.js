const Validator = require('node-input-validator');

const Booking = require('../model/booking');
const Hostel = require('../model/hostel');

const DBErrors = require('../utils/errors/db');

const PATH_TO_VIEW = 'portal/index';

exports.getAddBooking = (req, res) => {
    if (!req.query.id) {
        req.query.id = '';
    }
    Hostel.allRooms()
    .then(data => {
        const rooms = data[0];
        return rooms;
    })
    .then(rooms => {
        res.status(200).render(PATH_TO_VIEW, {
            title: 'New room booking',
            page: '../booking/add.ejs',
            action: '/booking',
            method: 'POST',
            formTitle: 'New room booking',
            errors: {type: '', message: ''},
            booking: {resident: req.query.id},
            rooms
        });
    })
    .catch(err => {
        req.flash('type', 'err');
        req.flash('message', 'A server problem occured.');
        res.redirect('/booking/search');
    });
};
exports.add = (req, res) => {
    const body = req.body;
    const validator = new Validator(body, {
        resident: 'required',
        room: 'required',
        occupants: 'required|integer',
        paid: 'required|integer',
        year: 'required|integer',
        startMonth: 'required',
        endMonth: 'required'
    });
    validator.check()
    .then(matched => {
        if (matched) {
            const booking = new Booking(null, body.resident, body.room, body.occupants, body.paid, body.year, body.startMonth, 
                body.endMonth, req.session.user || '');
            let rooms;
            Hostel.allRooms()
            .then(roomData => {
                rooms = roomData[0];
                return booking.save();
            })
            .then(() => {
                DBErrors.insert(null, {}, {
                    page: PATH_TO_VIEW, 
                    data: {
                        page: '../booking/add.ejs',
                        formTitle: 'Add new booking',
                        method: 'POST',
                        action: '/booking',
                        title: 'Book room',
                        rooms,
                        booking: {}
                    }
                }, res);
            })
            .catch( err => {
                DBErrors.insert(err, {
                    resident: 'Resident may have already booked or does not exist.',
                    occupants: `Check the maximum number of occupants`,
                    creator: `Authorization failed.`
                }, {
                    page: PATH_TO_VIEW,
                    data: {
                        page: '../booking/add.ejs',
                        formTitle: 'Add new booking',
                        method: 'POST',
                        action: '/booking',
                        title: 'New booking',
                        booking,
                        rooms
                    }
                }, res);
            });
        } else {
            res.status(422).send(`User input error. Please fill all required fields.`);
        }
    })
    .catch(() => {
        res.status(500).send(`Server error.`);
    });
};
exports.delete = (req, res) => {
    if (!req.query.id) {
        req.flash('type', 'error');
        req.flash('message', 'Url input error.')
        return res.redirect('/booking/search');
    }
    Booking.delete(req.query.id)
    .then(data => {
        DBErrors.delete(null, data[0], {
            page: PATH_TO_VIEW,
            data: {
                title: 'Search booking',
                formTitle: 'Search booking',
                method: 'POST', 
                action: '/booking/search',
                page: '../booking/search'
            }
        }, res);
    })
    .catch((err) => {
        DBErrors.delete(err, {}, {
            page: PATH_TO_VIEW,
            data: {
                title: 'Search booking',
                formTitle: 'Search booking',
                method: 'POST', 
                action: '/booking/search',
                page: '../booking/search'
            }
        }, res);
    });
};
exports.view = (req, res) => {
    if (!req.query.id) {
        req.flash('type', 'error');
        req.flash('message', 'Url input error.');
        return res.redirect('/booking/search');
    }
    Booking.view(req.query.id)
    .then(data => {
        let booking = data[0];
        res.render(PATH_TO_VIEW, {
            title: 'Viewing booking',
            page: '../booking/view.ejs',
            booking
        });
    })
    .catch(() => {
        req.flash('type', 'error');
        req.flash('message', 'Server error.');
        return res.redirect('/booking/search');
    });
};
exports.viewAll = (req, res) => {
    Booking.viewAll()
    .then(data => {
        const results = data[0];
        for (let result of results) {
            let due = Number.parseInt(result.credit.replace('.00', '').replace(',', ''));
            let paid = Number.parseInt(result.paid.replace('.00', '').replace(',', ''));
            let balance = due-paid;
            result.visibles = [{
                key: `ID`,
                text: result.id
            },{
                key: `Reg`,
                text: result.resident
            },{
                key: `Name`,
                text: result.name
            },{
                key: `Hostel`,
                text: result.title
            },{
                key: `Room`,
                text: result.room
            },{
                key: `Occupants`,
                text: result.occupants
            },{
                key: `Paid`,
                text: result.paid
            },{
                key: `Total`,
                text: result.credit
            },{
                key: `Period`,
                text: `${result.year} - ${result.startMonth} - ${result.endMonth}`
            }];
            result.actions = [{
                href: '/booking/view?id='+result.id,
                text: 'View'
            },{
                href: '/booking/delete?id='+result.id,
                text: 'Delete'
            }];
            if (balance > 0) {
                result.actions.unshift({
                    href: '/booking/pay?id='+result.id,
                    text: 'Pay'
                });
            }
        }
        res.render(PATH_TO_VIEW, {
            title: 'Viewing residents',
            page: '../shared/search-results.ejs',
            results
        });
    })
    .catch(() => {
        req.flash('type', 'error');
        req.flash('message', 'Server error.');
        return res.redirect('/residents/search');
    });
};
exports.getViewPerPeriod = (req, res) => {
    res.render(PATH_TO_VIEW, {
        title: 'View bookings by period',
        page: '../booking/search-period.ejs',
        action: '/booking/per-period',
        method: 'POST',
        formTitle: 'View by period',
        errors: {
            type: req.flash('type'),
            message: req.flash('message')
        }
    });
};
exports.postViewPerPeriod = (req, res) => {
    const body = req.body;
    const validator = new Validator(body, {
        year: 'required|integer',
        startMonth: 'required'
    });
    validator.check()
    .then(matched => {
        if (matched) {
            Booking.viewPerPeriod(body.year, body.startMonth)
            .then(data => {
                const results = data[0];
                for (let result of results) {
                    let due = Number.parseInt(result.credit.replace('.00', '').replace(',', ''));
                    let paid = Number.parseInt(result.paid.replace('.00', '').replace(',', ''));
                    let balance = due-paid;
                    result.visibles = [{
                        key: `ID`,
                        text: result.id
                    },{
                        key: `Reg`,
                        text: result.resident
                    },{
                        key: `Name`,
                        text: result.name
                    },{
                        key: `Hostel`,
                        text: result.title
                    },{
                        key: `Room`,
                        text: result.room
                    },{
                        key: `Occupants`,
                        text: result.occupants
                    },{
                        key: `Paid`,
                        text: result.paid
                    },{
                        key: `Total`,
                        text: result.credit
                    },{
                        key: `Period`,
                        text: `${result.year} - ${result.startMonth} - ${result.endMonth}`
                    }];
                    result.actions = [{
                        href: '/booking/view?id='+result.id,
                        text: 'View'
                    },{
                        href: '/booking/delete?id='+result.id,
                        text: 'Delete'
                    }];
                    if (balance > 0) {
                        result.actions.unshift({
                            href: '/booking/pay?id='+result.id,
                            text: 'Pay'
                        });
                    }
                }
                res.render(PATH_TO_VIEW, {
                    title: 'Viewing bookings',
                    page: '../shared/search-results.ejs',
                    results
                });
            })
            .catch(() => {
                req.flash('type', 'error');
                req.flash('message', 'Server problem.');
                return res.redirect('/booking/per-period');
            });
        } else {
            req.flash('type', 'error');
            req.flash('message', 'Input value error.');
            return res.redirect('/booking/per-period');
        }
    })
    .catch(() => {
        res.send(`Server problem.`);
    });
};
exports.getViewBalance = (req, res) => {
    res.render(PATH_TO_VIEW, {
        title: 'View balance by period',
        page: '../booking/search-period.ejs',
        action: '/booking/balance',
        method: 'POST',
        formTitle: 'View balances',
        errors: {
            type: req.flash('type'),
            message: req.flash('message')
        }
    });
};
exports.postViewBalance = (req, res) => {
    const body = req.body;
    const validator = new Validator(body, {
        year: 'required|integer',
        startMonth: 'required'
    });
    validator.check()
    .then(matched => {
        if (matched) {
            Booking.viewBalance(body.year, body.startMonth)
            .then(data => {
                const results = data[0];
                for (let result of results) {
                    let due = Number.parseInt(result.credit.replace('.00', '').replace(',', ''));
                    let paid = Number.parseInt(result.paid.replace('.00', '').replace(',', ''));
                    let balance = due-paid;
                    result.visibles = [{
                        key: `ID`,
                        text: result.id
                    },{
                        key: `Reg`,
                        text: result.resident
                    },{
                        key: `Name`,
                        text: result.name
                    },{
                        key: `Hostel`,
                        text: result.title
                    },{
                        key: `Room`,
                        text: result.room
                    },{
                        key: `Occupants`,
                        text: result.occupants
                    },{
                        key: `Paid`,
                        text: result.paid
                    },{
                        key: `Total`,
                        text: result.credit
                    },{
                        key: `Period`,
                        text: `${result.year} - ${result.startMonth} - ${result.endMonth}`
                    }];
                    result.actions = [{
                        href: '/booking/view?id='+result.id,
                        text: 'View'
                    },{
                        href: '/booking/delete?id='+result.id,
                        text: 'Delete'
                    }];
                    if (balance > 0) {
                        result.actions.unshift({
                            href: '/booking/pay?id='+result.id,
                            text: 'Pay'
                        });
                    }
                }
                res.render(PATH_TO_VIEW, {
                    title: 'Viewing balance',
                    page: '../shared/search-results.ejs',
                    results
                });
            })
            .catch(() => {
                req.flash('type', 'error');
                req.flash('message', 'Server problem.');
                return res.redirect('/booking/balance');
            });
        } else {
            req.flash('type', 'error');
            req.flash('message', 'Input value error.');
            return res.redirect('/booking/balance');
        }
    })
    .catch(() => {
        res.send(`Server problem.`);
    });
};
exports.getSearch = (req, res) => {
    res.render(PATH_TO_VIEW, {
        title: 'Search bookings',
        formTitle: 'Search bookings',
        method: 'POST',
        action: '/booking/search',
        page: '../booking/search.ejs',
        errors: {type: req.flash('type'), message: req.flash('message')}
    });
};
exports.postSearch = (req, res) => {
    if (!req.body.keyword) {
        req.flash('type', 'error');
        req.flash('message', 'Provide a search keyword.');
        return res.redirect('/booking/search');
    }
    Booking.search(req.body.keyword)
    .then(data => {
        const results = data[0];
        for (let result of results) {
            let due = Number.parseInt(result.credit.replace('.00', '').replace(',', ''));
            let paid = Number.parseInt(result.paid.replace('.00', '').replace(',', ''));
            let balance = due-paid;
            result.visibles = [{
                key: `Reg`,
                text: result.resident
            }, {
                key: `Name`,
                text: result.name
            },{
                key: `Paid`,
                text: `KES. ${result.paid}`
            },{
                key: `Balance`,
                text: `KES. ${balance}`
            },{
                key: `Period`,
                text: `${result.year}-${result.startMonth}-${result.endMonth}`
            }];
            result.actions = [{
                href: '/booking/view?id='+result.id,
                text: 'View'
            },{
                href: '/booking/delete?id='+result.id,
                text: 'Delete'
            }];
            if (balance > 0) {
                result.actions.unshift({
                    href: '/booking/pay?id='+result.id,
                    text: 'Pay'
                });
            }
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
        return res.redirect('/booking/search');
    });
};
exports.getPay = (req, res) => {
    if (!req.query.id) {
        req.flash('type', 'error');
        req.flash('message', 'Url input error.');
        return res.redirect('/booking/search');
    }
    res.render(PATH_TO_VIEW, {
        title: 'Pay room',
        page: '../booking/pay.ejs',
        action: '/booking/pay',
        method: 'POST',
        formTitle: 'Pay room',
        errors: {type: req.flash('type'), message: req.flash('message')},
        id: req.query.id
    });
};
exports.postPay = (req, res) => {
    const body = req.body;
    const validator = new Validator(body, {
        id: 'required|integer',
        amount: 'required|integer'
    });
    validator.check()
    .then(matched => {
        if (matched) {
            Booking.pay(body.id, body.amount)
            .then((data) => {
                DBErrors.update(null, data[0], {}, {
                    page: PATH_TO_VIEW,
                    data: {
                            title: 'Search booking',
                            page: '../booking/search.ejs',
                            action: '/booking/search',
                            method: 'POST',
                            formTitle: 'Search booking',
                            errors: {type: req.flash('type'), message: req.flash('message')}
                        }
                    }
                , res);
            })
            .catch(err => {
                DBErrors.update(err, {}, {
                    id: `Booking ID not found.`,
                }, {
                    page: PATH_TO_VIEW,
                    data: {
                        title: 'Search booking',
                        page: '../booking/search.ejs',
                        action: '/booking/search',
                        method: 'POST',
                        formTitle: 'Search booking',
                        errors: {type: req.flash('type'), message: req.flash('message')}
                    }
                }
                , res);
            });
        } else {
            res.status(422).send(`Input problems were found.`);
        }
    })
    .catch(() => {
        res.status(500).send(`Server encountered a problem.`);
    });
};