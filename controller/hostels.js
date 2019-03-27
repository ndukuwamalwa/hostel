const Validator = require('node-input-validator');

const Hostel = require('../model/hostel');
const DBErrors = require('../utils/errors/db')

const PATH_TO_VIEW = 'portal/index';

exports.getAddHostel = (req, res) => {
    res.status(200).render(PATH_TO_VIEW, {
        title: 'New hostel',
        page: '../hostel/add.ejs',
        action: '/hostels',
        method: 'POST',
        formTitle: 'Add new hostel',
        errors: {type: '', message: ''},
        hostel : {}
    });
};
exports.add = (req, res) => {
    const body = req.body;
    const validator = new Validator(body, {
        title: 'required',
        capacity: 'required|integer'
    });
    validator.check()
    .then(matched => {
        if (matched) {
            const hostel = new Hostel('', body.title, body.capacity, req.session.user || '');
            hostel.save()
            .then(() => {
                DBErrors.insert(null, {}, {
                    page: PATH_TO_VIEW, 
                    data: {
                        page: '../hostel/add.ejs',
                        formTitle: 'Add new hostel',
                        method: 'POST',
                        action: '/hostels',
                        title: 'New hostel',
                        hostel: {hostelNo: ''}
                    }
                }, res);
            })
            .catch(err => {
                DBErrors.insert(err, {
                    title: 'Hostel name already exists.',
                    creator: `Authorization failed.`
                }, {
                    page: PATH_TO_VIEW,
                    data: {
                        page: '../hostel/add.ejs',
                        formTitle: 'Add new hostel',
                        method: 'POST',
                        action: '/hostels',
                        title: 'New hostel',
                        hostel
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
exports.getAddRoom = (req, res) => {
    Hostel.viewAll()
    .then(data => {
        const hostels = data[0];
        res.render(PATH_TO_VIEW, {
            title: 'Add new room',
            page: '../hostel/add-room.ejs',
            action: '/hostels/rooms',
            method: 'POST',
            formTitle: 'Add new room',
            errors: {type: '', message: ''},
            hostels,
            room: {}
        });
    })
    .catch(() => {
        req.flash('type', 'err');
        req.flash('message', 'A server problem occured.');
        res.redirect('/hostels/rooms/search');
    });
};
exports.postAddRoom = (req, res) => {
    const body = req.body;
    const validator = new Validator(body, {
        hostel: 'required',
        capacity: 'required|integer',
        price: 'required|integer'
    });
    validator.check()
    .then(matched => {
        if (matched) {
            let hostels = [];
            Hostel.viewAll()
            .then(data => {
                hostels = data[0];
                return Hostel.addRoom('', body.hostel, body.capacity, body.price, req.session.user || '');
            })
            .then(() => {
                DBErrors.insert(null, {}, {
                    page: PATH_TO_VIEW, 
                    data: {
                        page: '../hostel/add-room.ejs',
                        formTitle: 'Add new room',
                        method: 'POST',
                        action: '/hostels/rooms',
                        title: 'New room',
                        room: {roomNo: ''},
                        hostels
                    }
                }, res);
            })
            .catch(err => {
                DBErrors.insert(err, {
                    creator: `Authorization failed.`
                }, {
                    page: PATH_TO_VIEW,
                    data: {
                        page: '../hostel/add-room.ejs',
                        formTitle: 'Add new room',
                        method: 'POST',
                        action: '/hostels/rooms',
                        title: 'New room',
                        room: {hostel: body.hostel, capacity: body.capacity, price: body.price},
                        hostels
                    }
                }, res);
            });
        } else {
            res.status(422).send(`User input error.`);
        }
    })
    .catch(() => {
        res.status(500).send(`Server error.`);
    });
};
exports.getUpdate = (req, res) => {
    if (!req.query.id) {
        req.flash('type', 'error');
        req.flash('message', 'Url input error.');
        return res.redirect('/hostels/search');
    }
    Hostel.view(req.query.id)
    .then(data => {
        let hostel = data[0][0];
        res.render(PATH_TO_VIEW, {
            title: 'Update hostel',
            page: '../hostel/add.ejs',
            action: '/hostels/update',
            method: 'POST',
            formTitle: 'Update  hostel',
            errors: {type: req.flash('type'), message: req.flash('message')},
            hostel
        });
    })
    .catch(() => {
        req.flash('type', 'error');
        req.flash('message', 'Server error.');
        return res.redirect('/hostels/search');
    });
};
exports.postUpdate = (req, res) => {
    const body = req.body;
    const validator = new Validator(body, {
        hostelNo: 'required',
        title: 'required',
        capacity: 'required|integer'
    });
    const hostel = new Hostel(body.hostelNo, body.title, body.capacity);
    validator.check()
    .then(matched => {
        if (matched) {
            Hostel.update(body.hostelNo, body.title, body.capacity)
            .then((data) => {
                DBErrors.update(null, data[0], {}, {
                    page: PATH_TO_VIEW,
                    data: {
                            title: 'Update hostel',
                            page: '../hostel/add.ejs',
                            action: '/hostels/update',
                            method: 'POST',
                            formTitle: 'Update hostel',
                            errors: {type: req.flash('type'), message: req.flash('message')},
                            hostel
                        }
                    }
                , res);
            })
            .catch(err => {
                DBErrors.update(err, {}, {
                    title: `Title has already been used.`,
                }, {
                    page: PATH_TO_VIEW,
                    data: {
                            title: 'Update hostel',
                            page: '../hostel/add.ejs',
                            action: '/hostels/update',
                            method: 'POST',
                            formTitle: 'Update hostel',
                            errors: {type: req.flash('type'), message: req.flash('message')},
                            hostel
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
exports.postUpdateRoom = (req, res) => {
    const body = req.body;
    const validator = new Validator(body, {
        room: 'required',
        capacity: 'required|integer',
        price: 'required|integer'
    });
    validator.check()
    .then(matched => {
        if (matched) {
            Hostel.updateRoom(body.room, body.capacity, body.price)
            .then((data) => {
                DBErrors.update(null, data[0], {}, {
                    page: PATH_TO_VIEW,
                    data: {
                            title: 'Update room',
                            page: '../hostel/add-room.ejs',
                            action: '/hostels/rooms/update',
                            method: 'POST',
                            formTitle: 'Update room',
                            errors: {type: req.flash('type'), message: req.flash('message')},
                            room: {roomNo: body.room, capacity: body.capacity, price: body.price}
                        }
                    }
                , res);
            })
            .catch(err => {
                DBErrors.update(err, {}, {}, {
                    page: PATH_TO_VIEW,
                    data: {
                            title: 'Update room',
                            page: '../hostel/add-room.ejs',
                            action: '/hostels/rooms/update',
                            method: 'POST',
                            formTitle: 'Update hostel',
                            errors: {type: req.flash('type'), message: req.flash('message')},
                            room: {roomNo: body.room, capacity: body.capacity, price: body.price}
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
exports.getUpdateRoom = (req, res) => {
    if (!req.query.id) {
        req.flash('type', 'error');
        req.flash('message', 'Url input error.');
        return res.redirect('/hostels/rooms/search');
    }
    Hostel.viewRoom(req.query.id)
    .then(data => {
        let room = data[0][0];
        room.price = room.price.replace(',', '').replace('.00', '');
        res.render(PATH_TO_VIEW, {
            title: 'Update room',
            page: '../hostel/add-room.ejs',
            action: '/hostels/rooms/update',
            method: 'POST',
            formTitle: 'Update  room',
            errors: {type: req.flash('type'), message: req.flash('message')},
            room
        });
    })
    .catch(() => {
        req.flash('type', 'error');
        req.flash('message', 'Server error.');
        return res.redirect('/hostels/search');
    });
};
exports.delete = (req, res) => {
    if (!req.query.id) {
        req.flash('type', 'error');
        req.flash('message', 'Url input error.')
        return res.redirect('/hostels/search');
    }
    Hostel.delete(req.query.id)
    .then(data => {
        DBErrors.delete(null, data[0], {
            page: PATH_TO_VIEW,
            data: {
                title: 'Delete hostel',
                formTitle: 'Search hostel',
                method: 'POST', 
                action: '/hostels/search',
                page: '../hostel/search'
            }
        }, res);
    })
    .catch((err) => {
        DBErrors.delete(err, {}, {
            page: PATH_TO_VIEW,
            data: {
                title: 'Delete hostel',
                formTitle: 'Search hostel',
                method: 'POST', 
                action: '/hostels/search',
                page: '../hostel/search.ejs'
            }
        }, res);
    });
};
exports.deleteRoom = (req, res) => {
    if (!req.query.id) {
        req.flash('type', 'error');
        req.flash('message', 'Url input error.')
        return res.redirect('/hostels/rooms/search');
    }
    Hostel.deleteRoom(req.query.id)
    .then(data => {
        DBErrors.delete(null, data[0], {
            page: PATH_TO_VIEW,
            data: {
                title: 'Search room',
                formTitle: 'Search room',
                method: 'POST', 
                action: '/hostels/rooms/search',
                page: '../hostel/search.ejs'
            }
        }, res);
    })
    .catch((err) => {
        DBErrors.delete(err, {}, {
            page: PATH_TO_VIEW,
            data: {
                title: 'Search room',
                formTitle: 'Search room',
                method: 'POST', 
                action: '/hostels/rooms/search',
                page: '../hostel/search.ejs'
            }
        }, res);
    });
};
exports.view = (req, res) => {
    if (!req.query.id) {
        req.flash('type', 'error');
        req.flash('message', 'Url input error.');
        return res.redirect('/hostels/search');
    }
    Hostel.view(req.query.id)
    .then(data => {
        let hostel = data[0];
        res.render(PATH_TO_VIEW, {
            title: 'Viewing hostel',
            page: '../hostel/view.ejs',
            hostel
        });
    })
    .catch(() => {
        req.flash('type', 'error');
        req.flash('message', 'Server error.');
        return res.redirect('/resident/search');
    });
};
exports.viewRoom = (req, res) => {
    if (!req.query.id) {
        req.flash('type', 'error');
        req.flash('message', 'Url input error.');
        return res.redirect('/hostels/rooms/search');
    }
    Hostel.viewRoom(req.query.id)
    .then(data => {
        let room = data[0];
        res.render(PATH_TO_VIEW, {
            title: 'Viewing hostel',
            page: '../hostel/view-room.ejs',
            room
        });
    })
    .catch(() => {
        req.flash('type', 'error');
        req.flash('message', 'Server error.');
        return res.redirect('/resident/rooms/search');
    });
};
exports.viewRooms = (req, res) => {
    if (!req.query.id) {
        return res.status(422).send();
    }
    Hostel.viewRooms(req.query.id)
    .then(data => {
        let rooms = data[0];
        res.render(PATH_TO_VIEW, {
            title: 'Viewing hostel rooms',
            page: '../hostel/hostel-rooms.ejs',
            rooms
        });
    })
    .catch((err) => {
        console.log(err);
        req.flash('type', 'error');
        req.flash('message', 'Server error.');
        return res.redirect('/hostels/search');
    });
};
exports.viewAll = (req, res) => {
    Hostel.viewAll()
    .then(data => {
        const results = data[0];
        for (let result of results) {
            result.visibles = [{
                key: `No.`,
                text: result.hostelNo
            }, {
                key: `Name`,
                text: result.title
            },{
                key: `Capacity`,
                text: result.capacity
            },{
                key: `Date created`,
                text: result.created
            }];
            result.actions = [{
                href: '/hostels/view?id='+result.hostelNo,
                text: 'View'
            },{
                href: '/hostels/view-rooms?id='+result.hostelNo,
                text: 'Rooms'
            },{
                href: '/hostels/update?id='+result.hostelNo,
                text: 'Update'
            },{
                href: '/hostels/delete?id='+result.hostelNo,
                text: 'Delete'
            }];
        }
        res.render(PATH_TO_VIEW, {
            title: 'Viewing hostels',
            page: '../shared/search-results.ejs',
            results
        });
    })
    .catch(() => {
        req.flash('type', 'error');
        req.flash('message', 'Server error.');
        return res.redirect('/hostels/search');
    });
};
exports.viewAllRooms = (req, res) => {
    Hostel.allRooms()
    .then(data => {
        const results = data[0];
        for (let result of results) {
            result.visibles = [{
                key: `No.`,
                text: result.roomNo
            },{
                key: `Hostel No.`,
                text: result.hostel
            },{
                key: `Hostel name`,
                text: result.title
            },{
                key: `Capacity`,
                text: result.capacity
            },{
                key: `Rent Price`,
                text: result.price
            }];
            result.actions = [{
                href: '/hostels/rooms/view?id='+result.roomNo,
                text: 'View'
            },{
                href: '/hostels/rooms/update?id='+result.roomNo,
                text: 'Update'
            },{
                href: '/hostels/rooms/delete?id='+result.roomNo,
                text: 'Delete'
            }];
        }
        res.render(PATH_TO_VIEW, {
            title: 'Viewing rooms',
            page: '../shared/search-results.ejs',
            results
        });
    })
    .catch(() => {
        req.flash('type', 'error');
        req.flash('message', 'Server error.');
        return res.redirect('/hostels/rooms/search');
    });
};
exports.getSearch = (req, res) => {
    res.render(PATH_TO_VIEW, {
        title: 'Search hostel',
        method: 'POST',
        action: '/hostels/search',
        page: '../hostel/search.ejs',
        formTitle: 'Search hostel',
        errors: {type: req.flash('type'), message: req.flash('message')}
    });
};
exports.postSearch = (req, res) => {
    if (!req.body.keyword) {
        req.flash('type', 'error');
        req.flash('message', 'Provide a search keyword.');
        return res.redirect('/booking/search');
    }
    Hostel.search(req.body.keyword)
    .then(data => {
        const results = data[0];
        for (let result of results) {
            result.visibles = [{
                key: `No.`,
                text: result.hostelNo
            }, {
                key: `Name`,
                text: result.title
            },{
                key: `Capacity`,
                text: result.capacity
            }];
            result.actions = [{
                href: '/hostels/view?id='+result.hostelNo,
                text: 'View'
            },{
                href: '/hostels/view-rooms?id='+result.hostelNo,
                text: 'Rooms'
            },{
                href: '/hostels/update?id='+result.hostelNo,
                text: 'Update'
            },{
                href: '/hostels/delete?id='+result.hostelNo,
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
exports.getSearchRoom = (req, res) => {
    res.render(PATH_TO_VIEW, {
        title: 'Search room',
        page: '../hostel/search.ejs',
        action: '/hostels/rooms/search',
        method: 'POST',
        formTitle: 'Search room',
        errors: {type: req.flash('type'), message: req.flash('message')}
    });
};
exports.postSearchRoom = (req, res) => {
    if (!req.body.keyword) {
        req.flash('type', 'error');
        req.flash('message', 'Provide a search keyword.');
        return res.redirect('/booking/search');
    }
    Hostel.searchRoom(req.body.keyword)
    .then(data => {
        const results = data[0];
        for (let result of results) {
            result.visibles = [{
                key: `No`,
                text: result.roomNo
            }, {
                key: `Name`,
                text: result.title
            },{
                key: `Capacity`,
                text: result.capacity
            }];
            result.actions = [{
                href: '/hostels/rooms/view?id='+result.roomNo,
                text: 'View'
            },{
                href: '/hostels/rooms/update?id='+result.roomNo,
                text: 'Update'
            },{
                href: '/hostels/rooms/delete?id='+result.roomNo,
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
        return res.redirect('/hostels/rooms/search');
    });
};