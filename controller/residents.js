const Validator = require('node-input-validator');

const Resident = require('../model/resident');

const DBErrors = require('../utils/errors/db');

const PATH_TO_VIEW = 'portal/index';

exports.getAddResident = (req, res) => {
    res.status(200).render(PATH_TO_VIEW, {
        title: 'New resident',
        page: '../resident/add.ejs',
        action: '/residents',
        method: 'POST',
        formTitle: 'Add new resident',
        errors: {
            type: req.flash('type'),
            message: req.flash('message')
        },
        resident : {admNo: ''}
    });
};
exports.add = (req, res) => {
    const body = req.body;
    const validator = new Validator(body, {
        admNo: 'required',
        fname: 'required',
        lname: 'required',
        phone: 'required',
        parentPhone: 'required',
        nationalId: 'required'
    });
    if (!body.othernames) {
        body.othernames = '';
    }
    validator.check()
    .then(matched => {
        if (matched) {
            const resident = new Resident(body.admNo, body.fname, body.lname, body.othernames, body.phone, body.parentPhone, 
                body.nationalId, req.session.user || '');
            resident.save()
            .then(() => {
                DBErrors.insert(null, {}, {
                    page: PATH_TO_VIEW, 
                    data: {
                        page: '../resident/add.ejs',
                        formTitle: 'Add new resident',
                        method: 'POST',
                        action: '/residents',
                        title: 'New resident',
                        resident: {admNo: ''}
                    }
                }, res);
            })
            .catch(err => {
                DBErrors.insert(err, {
                    primary: 'Admission number already exists',
                    phone: `Phone number has already been used.`,
                    nationalId: `National ID No. has already been used`,
                    creator: `Authorization failed.`
                }, {
                    page: PATH_TO_VIEW,
                    data: {
                        page: '../resident/add.ejs',
                        formTitle: 'Add new resident',
                        method: 'POST',
                        action: '/residents',
                        title: 'New resident',
                        resident
                    }
                }, res);
            });
        } else {
            res.status(422).send(`Server error.`);
        }
    })
    .catch(() => {
        res.status(500).send();
    });
};
exports.getUpdate = (req, res) => {
    if (!req.query.id) {
        req.flash('type', 'error');
        req.flash('message', 'Url input error.');
        return res.redirect('/residents/search');
    }
    Resident.viewRaw(req.query.id)
    .then(data => {
        let resident = data[0][0];
        res.render(PATH_TO_VIEW, {
            title: 'Update resident',
            page: '../resident/add.ejs',
            action: '/residents/update',
            method: 'POST',
            formTitle: 'Update  resident',
            errors: {type: req.flash('type'), message: req.flash('message')},
            resident
        });
    })
    .catch(() => {
        req.flash('type', 'error');
        req.flash('message', 'Server error.');
        return res.redirect('/resident/search');
    });
};
exports.update = (req, res) => {
    const body = req.body;
    const validator = new Validator(body, {
        admNo: 'required',
        fname: 'required',
        lname: 'required',
        phone: 'required',
        parentPhone: 'required',
        nationalId: 'required'
    });
    if (!body.othernames) {
        body.othernames = '';
    }
    const resident = new Resident(body.admNo, body.fname, body.lname, body.othernames, body.phone, body.parentPhone, body.nationalId);
    validator.check()
    .then(matched => {
        if (matched) {
            Resident.update(body.admNo, body.fname, body.lname, body.othernames, body.phone, body.parentPhone, body.nationalId)
            .then((data) => {
                DBErrors.update(null, data[0], {}, {
                    page: PATH_TO_VIEW,
                    data: {
                            title: 'Update resident',
                            page: '../resident/add.ejs',
                            action: '/residents/update',
                            method: 'POST',
                            formTitle: 'Update  resident',
                            errors: {type: req.flash('type'), message: req.flash('message')},
                            resident
                        }
                    }
                , res);
            })
            .catch(err => {
                DBErrors.update(err, {}, {
                    phone: `Phone number has already been used.`,
                    nationalId: `National ID No. has already been used`,
                    creator: `Authorization failed.`
                }, {
                    page: PATH_TO_VIEW,
                    data: {
                            title: 'Update resident',
                            page: '../resident/add.ejs',
                            action: '/residents/update',
                            method: 'POST',
                            formTitle: 'Update  resident',
                            errors: {type: req.flash('type'), message: req.flash('message')},
                            resident
                        }
                    }
                , res);
            });
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
        return res.redirect('/residents/search');
    }
    Resident.delete(req.query.id)
    .then(data => {
        DBErrors.delete(null, data[0], {
            page: PATH_TO_VIEW,
            data: {
                title: 'Delete resident',
                formTitle: 'Search resident',
                method: 'POST', 
                action: '/residents/search',
                page: '../resident/search'
            }
        }, res);
    })
    .catch((err) => {
        DBErrors.delete(err, {}, {
            page: PATH_TO_VIEW,
            data: {
                title: 'Delete resident',
                formTitle: 'Search resident',
                method: 'POST', 
                action: '/residents/search',
                page: '../resident/search'
            }
        }, res);
    });
};
exports.view = (req, res) => {
    if (!req.query.id) {
        req.flash('type', 'error');
        req.flash('message', 'Url input error.');
        return res.redirect('/residents/search');
    }
    Resident.view(req.query.id)
    .then(data => {
        let resident = data[0];
        res.render(PATH_TO_VIEW, {
            title: 'Viewing resident',
            page: '../resident/view.ejs',
            resident
        });
    })
    .catch(() => {
        req.flash('type', 'error');
        req.flash('message', 'Server error.');
        return res.redirect('/resident/search');
    });
};
exports.viewAll = (req, res) => {
    Resident.viewAll()
    .then(data => {
        const results = data[0];
        for (let result of results) {
            result.visibles = [{
                key: `Reg`,
                text: result.admNo
            }, {
                key: `Name`,
                text: result.name
            },{
                key: `Tel`,
                text: result.phone
            },{
                key: `Parent`,
                text: result.parentPhone
            },{
                key: `ID`,
                text: result.nationalId
            },{
                key: `Created`,
                text: result.created
            }];
            result.actions = [{
                href: '/residents/view?id='+result.admNo,
                text: 'View'
            },{
                href: '/booking?id='+result.admNo,
                text: 'Book Room'
            },{
                href: '/residents/update?id='+result.admNo,
                text: 'Update'
            },{
                href: '/residents/delete?id='+result.admNo,
                text: 'Delete'
            }];
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
exports.getSearch = (req, res) => {
    res.render(PATH_TO_VIEW, {
        title: 'Search residents',
        page: '../resident/search.ejs',
        action: '/residents/search',
        method: 'POST',
        formTitle: 'Search resident',
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
    Resident.search(req.body.keyword)
    .then(data => {
        const results = data[0];
        for (let result of results) {
            result.visibles = [{
                key: `Reg`,
                text: result.admNo
            }, {
                key: `Name`,
                text: result.name
            },{
                key: `Phone`,
                text: result.phone
            },{
                key: `ID`,
                text: result.nationalId
            }];
            result.actions = [{
                href: '/residents/view?id='+result.admNo,
                text: 'View'
            },{
                href: '/booking?id='+result.admNo,
                text: 'Book Room'
            },{
                href: '/residents/update?id='+result.admNo,
                text: 'Update'
            },{
                href: '/residents/delete?id='+result.admNo,
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
        return res.redirect('/residents/search');
    });
};
exports.getViewPerPeriod = (req, res) => {
    res.render(PATH_TO_VIEW, {
        title: 'View residents by period',
        page: '../resident/search-period.ejs',
        action: '/residents/period',
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
        startMonth: 'required',
        endMonth: 'required'
    });
    validator.check()
    .then(matched => {
        if (matched) {
            Resident.viewPerPeriod(body.year, body.startMonth, body.endMonth)
            .then(data => {
                const results = data[0];
                for (let result of results) {
                    result.visibles = [{
                        key: `Reg`,
                        text: result.admNo
                    }, {
                        key: `Name`,
                        text: result.name
                    },{
                        key: `Tel`,
                        text: result.phone
                    },{
                        key: `Room`,
                        text: result.room
                    },{
                        key: `Period`,
                        text: `${result.year}-${result.startMonth}-${result.endMonth}`
                    },{
                        key: `Amount`,
                        text: result.paid
                    }];
                    result.actions = [{
                        href: '/residents/view?id='+result.admNo,
                        text: 'View'
                    },{
                        href: '/booking?id='+result.admNo,
                        text: 'Book Room'
                    },{
                        href: '/residents/update?id='+result.admNo,
                        text: 'Update'
                    },{
                        href: '/residents/delete?id='+result.admNo,
                        text: 'Delete'
                    }];
                }
                res.render(PATH_TO_VIEW, {
                    title: 'Viewing residents',
                    page: '../shared/search-results.ejs',
                    results
                });
            })
            .catch(() => {
                req.flash('type', 'error');
                req.flash('message', 'Server problem.');
                return res.redirect('/residents/period');
            });
        } else {
            req.flash('type', 'error');
            req.flash('message', 'Input value error.');
            return res.redirect('/residents/period');
        }
    })
    .catch(() => {
        res.send(`Server problem.`);
    });
};
exports.getViewPerRoom = (req, res) => {
    res.render(PATH_TO_VIEW, {
        title: 'View residents by room',
        page: '../resident/search-room.ejs',
        action: '/residents/per-room',
        method: 'POST',
        formTitle: 'View by room',
        errors: {
            type: req.flash('type'),
            message: req.flash('message')
        }
    });
};
exports.postViewPerRoom = (req, res) => {
    const body = req.body;
    const validator = new Validator(body, {
        year: 'required|integer',
        startMonth: 'required',
        endMonth: 'required',
        room: 'required'
    });
    validator.check()
    .then(matched => {
        if (matched) {
            Resident.viewPerRoom(body.year, body.startMonth, body.endMonth, body.room)
            .then(data => {
                const results = data[0];
                for (let result of results) {
                    result.visibles = [{
                        key: `Reg`,
                        text: result.admNo
                    }, {
                        key: `Name`,
                        text: result.name
                    },{
                        key: `Tel`,
                        text: result.phone
                    },{
                        key: `Room`,
                        text: result.room
                    },{
                        key: `Period`,
                        text: `${result.year}-${result.startMonth}-${result.endMonth}`
                    },{
                        key: `Amount`,
                        text: result.paid
                    }];
                    result.actions = [{
                        href: '/residents/view?id='+result.admNo,
                        text: 'View'
                    },{
                        href: '/booking?id='+result.admNo,
                        text: 'Book Room'
                    },{
                        href: '/residents/update?id='+result.admNo,
                        text: 'Update'
                    },{
                        href: '/residents/delete?id='+result.admNo,
                        text: 'Delete'
                    }];
                }
                res.render(PATH_TO_VIEW, {
                    title: 'Viewing residents',
                    page: '../shared/search-results.ejs',
                    results
                });
            })
            .catch(() => {
                req.flash('type', 'error');
                req.flash('message', 'Server problem.');
                return res.redirect('/residents/per-room');
            });
        } else {
            req.flash('type', 'error');
            req.flash('message', 'Input value error.');
            return res.redirect('/residents/per-room');
        }
    })
    .catch(() => {
        res.send(`Server problem.`);
    });
};
exports.getViewPerHostel = (req, res) => {
    res.render(PATH_TO_VIEW, {
        title: 'View residents by hostel',
        page: '../resident/search-hostel.ejs',
        action: '/residents/per-hostel',
        method: 'POST',
        formTitle: 'View by hostel',
        errors: {
            type: req.flash('type'),
            message: req.flash('message')
        }
    });
};
exports.postViewPerHostel = (req, res) => {
    const body = req.body;
    const validator = new Validator(body, {
        year: 'required|integer',
        startMonth: 'required',
        endMonth: 'required',
        hostel: 'required'
    });
    validator.check()
    .then(matched => {
        if (matched) {
            Resident.viewPerHostel(body.year, body.startMonth, body.endMonth, body.hostel)
            .then(data => {
                const results = data[0];
                for (let result of results) {
                    result.visibles = [{
                        key: `Reg`,
                        text: result.admNo
                    }, {
                        key: `Name`,
                        text: result.name
                    },{
                        key: `Tel`,
                        text: result.phone
                    },{
                        key: `Room`,
                        text: result.room
                    },{
                        key: `Period`,
                        text: `${result.year}-${result.startMonth}-${result.endMonth}`
                    },{
                        key: `Amount`,
                        text: result.paid
                    }];
                    result.actions = [{
                        href: '/residents/view?id='+result.admNo,
                        text: 'View'
                    },{
                        href: '/booking?id='+result.admNo,
                        text: 'Book Room'
                    },{
                        href: '/residents/update?id='+result.admNo,
                        text: 'Update'
                    },{
                        href: '/residents/delete?id='+result.admNo,
                        text: 'Delete'
                    }];
                }
                res.render(PATH_TO_VIEW, {
                    title: 'Viewing residents',
                    page: '../shared/search-results.ejs',
                    results
                });
            })
            .catch(() => {
                req.flash('type', 'error');
                req.flash('message', 'Server problem.');
                return res.redirect('/residents/per-hostel');
            });
        } else {
            req.flash('type', 'error');
            req.flash('message', 'Input value error.');
            return res.redirect('/residents/per-hostel');
        }
    })
    .catch(() => {
        res.send(`Server problem.`);
    });
};