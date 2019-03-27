const mysql = require('mysql2');

const options = {
    user: 'justin',
    host: 'localhost',
    database: 'silwal',
    password: '@justin#94'
};

const connection = mysql.createPool(options);

module.exports = connection.promise();