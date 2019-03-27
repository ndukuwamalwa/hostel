const mysql = require('../utils/mysql');

module.exports = class User {
    constructor(email, password, level, creator) {
        this.email = email;
        this.password = password;
        this.level = level;
        this.creator = creator;
    }

    save() {
        return mysql.execute(`INSERT INTO user(email, password, level, creator) VALUES(?, ?, ?, ?)`, [this.email, this.password,
        this.level, this.creator]);
    }

    static changePassword(email, password) {
        return mysql.execute(`UPDATE user SET password = ? WHERE email = ?`, [password, email]);
    }   

    static delete(email) {
        return mysql.execute(`DELETE FROM user WHERE email = ?`, [email]);
    }   

    static view(email) {
        return mysql.execute(`SELECT * FROM user_view WHERE email = ?`, [email]);
    }

    static viewAll() {
        return mysql.execute(`SELECT * FROM user_view`);
    }

    static search(keyword) {
        return mysql.execute(`SELECT * FROM user_view WHERE email REGEXP ?`, [keyword]);
    }

    static login(username) {
        return mysql.execute('SELECT email, password, ready FROM user WHERE email = ?', [username]);
    }

    static saveToken(username, token) {
        return mysql.execute(`INSERT INTO tokens(username, token, used) VALUES(?, ?, 0)`, [username, token]);
    }

    static checkToken(username) {
        return mysql.execute('SELECT username, token FROM tokens WHERE username = ? ORDER BY id DESC LIMIT 1', [username]);
    }
}