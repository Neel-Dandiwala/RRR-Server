"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connection = void 0;
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb+srv://mongodb:mongodb@rrrcluster.nluljzi.mongodb.net/?";
let _db;
exports.connection = {
    connectToServer: function (callback) {
        MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
            _db = client.db('rrrdatabase');
            return callback(err);
        });
    },
    getDb: function () {
        return _db;
    }
};
//# sourceMappingURL=connection.js.map