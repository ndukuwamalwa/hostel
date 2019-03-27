const mysql = require('../utils/mysql');

module.exports = class Hostel {
    constructor(hostelNo, title, capacity, creator) {
        this.hostelNo = hostelNo;
        this.title = title;
        this.capacity = capacity;
        this.creator = creator;
    }

    save() {
        return mysql.execute(`INSERT INTO hostel(hostelNo, title, capacity, creator) VALUES(?, ?, ?, ?)`, [this.hostelNo, this.title,
        this.capacity, this.creator]);
    }

    static update(hostelNo, title, capacity) {
        return mysql.execute(`UPDATE hostel SET title = ?, capacity = ? WHERE hostelNo = ?`, [title, capacity, hostelNo]);
    }

    static delete(hostelNo) {
        return mysql.execute(`DELETE FROM hostel WHERE hostelNo = ?`, [hostelNo]);
    }

    static view(hostelNo) {
        return mysql.execute(`SELECT * FROM hostel_view WHERE hostelNo = ?`, [hostelNo]);
    }

    static viewAll() {
        return mysql.execute(`SELECT * FROM hostel_view`);
    }

    static search(keyword) {
        return mysql.execute(`SELECT * FROM hostel WHERE CONCAT(hostelNo, title, capacity) REGEXP ?`, [keyword]);
    }

    static addRoom(roomNo, hostel, capacity, price, creator) {
        return mysql.execute(`INSERT INTO room(roomNo, hostel, capacity, price, creator) VALUES (?, ?, ?, ?, ?)`, [roomNo, hostel,
        capacity, price, creator]);
    }

    static updateRoom(roomNo, capacity, price) {
        return mysql.execute(`UPDATE room SET capacity = ?, price = ? WHERE roomNo = ?`, [capacity, price, roomNo]);
    }

    static allRooms() {
        return mysql.execute(`SELECT * FROM room_view`);
    }

    static deleteRoom(roomNo) {
        return mysql.execute(`DELETE FROM room WHERE roomNo = ?`, [roomNo]);
    }

    static viewRoom(roomNo) {
        return mysql.execute(`SELECT * FROM room_view WHERE roomNo = ?`, [roomNo]);
    }

    static viewRooms(hostelNo) {
        return mysql.execute(`SELECT * FROM room_view WHERE hostel = ?`, [hostelNo]);
    }

    static searchRoom(keyword) {
        return mysql.execute(`SELECT room.roomNo, room.hostel, hostel.title, room.capacity, room.price FROM room 
        INNER JOIN hostel ON room.hostel = hostel.hostelNo 
        WHERE CONCAT(room.hostel, hostel.title, CONCAT(room.capacity, room.roomNo, room.price)) REGEXP ?`, [keyword]);
    }
}