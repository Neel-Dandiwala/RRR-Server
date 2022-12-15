"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connection = void 0;
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
exports.connection = new MongoClient('mongodb+srv://mongodb:mongodb@rrrcluster.nluljzi.mongodb.net/rrrdatabase?retryWrites=true&w=majority', { useNewUrlParser: true });
//# sourceMappingURL=connection.js.map