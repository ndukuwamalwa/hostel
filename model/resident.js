const mysql = require('../utils/mysql');

module.exports = class Resident {
    constructor(admNo, fname, lname, othernames, phone, parentPhone, nationalId, creator) {
        this.admNo = admNo;
        this.fname = fname;
        this.lname = lname;
        this.othernames = othernames;
        this.phone = phone;
        this.parentPhone = parentPhone;
        this.nationalId = nationalId;
        this.creator = creator;
    }

    save() {
        return mysql.execute(`INSERT INTO resident(admNo, fname, lname, othernames, phone, parentPhone, nationalId, creator) VALUES
        (?, ?, ?, ?, ?, ?, ?, ?)`, [this.admNo, this.fname, this.lname, this.othernames, this.phone, this.parentPhone, this.nationalId,
        this.creator]);
    }

    static update(admNo, fname, lname, othernames, phone, parentPhone, nationalId) {
        return mysql.execute(`UPDATE resident SET fname = ?, lname =?, othernames = ?, phone = ?, parentPhone = ?, nationalId = ? WHERE
        admNo = ?`, [fname, lname, othernames, phone, parentPhone, nationalId, admNo]);
    }

    static delete(admNo) {
        return mysql.execute(`DELETE FROM resident WHERE admNo = ?`, [admNo]);
    }

    static view(admNo) {
        return mysql.execute(`SELECT * FROM resident_view WHERE admNo = ?`, [admNo]);
    }
    static viewRaw(admNo) {
        return mysql.execute(`SELECT * FROM resident WHERE admNo = ?`, [admNo]);
    }

    static viewAll() {
        return mysql.execute(`SELECT * FROM resident_view`);
    }

    static search(keyword) {
        return mysql.execute(`SELECT * FROM resident_view WHERE CONCAT(admNo, name, CONCAT(phone, parentPhone, nationalId)) REGEXP ?`,
        [keyword]);
    }

    static viewPerPeriod(year, startMonth, endMonth) {
        return mysql.execute(`SELECT * FROM resident_view INNER JOIN residentRoom ON resident_view.admNo = residentRoom.resident
        WHERE residentRoom.year = ? AND residentRoom.startMonth = ? AND residentRoom.endMonth = ?`, [year, startMonth, endMonth]);
    }

    static viewPerRoom(year, startMonth, endMonth, room) {
        return mysql.execute(`SELECT * FROM resident_view INNER JOIN residentRoom ON resident_view.admNo = residentRoom.resident
        WHERE residentRoom.year = ? AND residentRoom.startMonth = ? AND residentRoom.endMonth = ? AND residentRoom.room = ?`, 
        [year, startMonth, endMonth, room]);
    }

    static viewPerHostel(year, startMonth, endMonth, hostel) {
        return mysql.execute(`SELECT * FROM resident_view INNER JOIN residentRoom ON resident_view.admNo = residentRoom.resident 
        INNER JOIN room ON residentRoom.room = room.roomNo INNER JOIN hostel ON room.hostel = hostel.hostelNo WHERE 
        residentRoom.year = ? AND residentRoom.startMonth = ? AND residentRoom.endMonth = ? AND hostel.hostelNo = ?`, 
        [year, startMonth, endMonth, hostel]);
    }
}