let mysql = require('mysql');

let connectionPool;

export default {
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

    query: function (sql, params = []) {
        return new Promise((resolve, reject) => {
            connectionPool.getConnection((err, connection) => {
                if (err) {
                    resolve(err);
                    return;
                }
                connection.query(sql, params, (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                    connectionPool.releaseConnection(connection);
                })

            })
        })
    },
};


