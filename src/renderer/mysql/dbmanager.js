let mysql = require('mysql');

let connectionPool;

module.exports = {
    testConnection(params, callback) {
        let connection = mysql.createConnection({
            host: params.hostName,
            user: params.username,
            password: params.password,
            port: params.port,
            database: params.schema
        });
        connection.connect(function (error) {
            if (error) {
                callback("error", error)
            } else {
                callback("success")
            }
        });
        connection.end();
    },

    connectDb(params) {
        connectionPool = mysql.createPool({
            connectionLimit: 30,
            host: params.hostName,
            user: params.username,
            password: params.password,
            port: params.port,
            database: params.schema
        });
    },

    query(sql, params, callback) {
        let _params = [];
        let _callback;
        if (arguments.length === 2 && typeof arguments[1] == 'function') {
            _callback = params;
        } else if (arguments.length === 3 && Array.isArray(arguments[1]) && typeof arguments[2] === 'function') {
            _params = params;
            _callback = callback;
        }
        connectionPool.getConnection(function (err, connection) {
            if (err) {
                _callback.apply(null, [err]);
                return
            }
            connection.query(sql, _params, function () {
                connectionPool.releaseConnection(connection);
                _callback.apply(null, arguments)
            })
        })
    }
};


