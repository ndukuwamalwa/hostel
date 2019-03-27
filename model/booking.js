const mysql = require('../utils/mysql');

module.exports = class Booking {
    constructor(id, resident, room, occupants, paid, year, startMonth, endMonth, creator) {
        this.id = id;
        this.resident = resident;
        this.room = room;
        this.occupants = occupants;
        this.paid = paid;
        this.credit = 0;
        this.year = year;
        this.startMonth = startMonth;
        this.endMonth = endMonth;
        this.creator = creator;
    }

    save() {
        return mysql.execute(`INSERT INTO booking(id, resident, room, occupants, paid, credit, year, startMonth, endMonth, creator) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [this.id, this.resident, this.room, this.occupants, this.paid, this.credit,
        this.year, this.startMonth, this.endMonth, this.creator]);
    }

    static delete(id) {
        return mysql.execute(`DELETE FROM booking WHERE id = ?`, [id]);
    }

    static view(id) {
        return mysql.execute(`SELECT * FROM booking_view WHERE id = ?`, [id]);
    }

    static viewAll() {
        return mysql.execute(`SELECT * FROM booking_view`);
    }

    static search(keyword) {
        return mysql.execute(`SELECT * FROM booking_view WHERE CONCAT(resident, room, name) REGEXP ?`, [keyword]);
    }

    static viewPerPeriod(year, startMonth) {
        return mysql.execute(`SELECT * FROM booking_view WHERE year = ? AND startMonth = ?`, [year, startMonth]);
    }

    static viewBalance(year, startMonth) {
        return mysql.execute(`SELECT * FROM booking_view WHERE year = ? AND startMonth = ? AND (credit-paid) > 0`, [year, startMonth]);
    }

    static pay(id, amount) {
        return mysql.execute(`UPDATE booking SET paid = paid + ? WHERE id = ?`, [amount, id]);
    }
}