"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const argon2_1 = __importDefault(require("argon2"));
const connection_1 = require("../connection");
const mongodb_1 = require("mongodb");
const mongoose_1 = __importDefault(require("mongoose"));
class AdminResponse {
}
const getAdminQueries = async (req, res) => {
    const db = await connection_1.connection.getDb();
    const collection = db.collection('queries');
    try {
        let result;
        let logs;
        try {
            result = await collection.find({ querySolved: false }, { projection: { _id: 1, queryEmail: 1, queryText: 1 } }).toArray();
        }
        catch (err) {
            if (err instanceof mongodb_1.MongoServerError && err.code === 11000) {
                console.error("# Duplicate Data Found:\n", err);
                logs = [{
                        field: "Unexpected Mongo Error",
                        message: "Default Message"
                    }];
                res.status(400).json({ logs });
                return { logs };
            }
            else {
                res.status(400).json({ err });
                throw new Error(err);
            }
        }
        if (result) {
            logs = [
                {
                    field: "Successful Retrieval",
                    message: "Queries",
                }
            ];
            res.status(200).json({ result });
            return { logs };
        }
        else {
            logs = [
                {
                    field: "Unknown Error Occurred",
                    message: "Better check with administrator",
                }
            ];
            res.status(400).json({ logs });
            return { logs };
        }
    }
    catch (e) {
        res.status(400).json({ e });
        throw e;
    }
};
const getAdminTokens = async (req, res) => {
    const db = await connection_1.connection.getDb();
    const collection = db.collection('tokens');
    try {
        let result;
        let logs;
        try {
            result = await collection.find({}).toArray();
        }
        catch (err) {
            if (err instanceof mongodb_1.MongoServerError && err.code === 11000) {
                console.error("# Duplicate Data Found:\n", err);
                logs = [{
                        field: "Unexpected Mongo Error",
                        message: "Default Message"
                    }];
                res.status(400).json({ logs });
                return { logs };
            }
            else {
                res.status(400).json({ err });
                throw new Error(err);
            }
        }
        if (result) {
            logs = [
                {
                    field: "Successful Retrieval",
                    message: "Tokens",
                }
            ];
            res.status(200).json({ result });
            return { logs };
        }
        else {
            logs = [
                {
                    field: "Unknown Error Occurred",
                    message: "Better check with administrator",
                }
            ];
            res.status(400).json({ logs });
            return { logs };
        }
    }
    catch (e) {
        res.status(400).json({ e });
        throw e;
    }
};
const getAdminSession = async (req, res) => {
    try {
        if (!req.session.authenticationID) {
            const logs = {
                field: "Session ID Missing",
                message: req.session.authenticationID
            };
            res.status(400).json({ logs });
        }
        else {
            const logs = {
                field: "Session ID There",
                message: req.session.authenticationID
            };
            res.status(400).json({ logs });
        }
    }
    catch (e) {
        res.status(400).json({ e });
        throw e;
    }
};
const logoutAdmin = async (req, res) => {
    try {
        let logs;
        if (!req.session) {
            logs = {
                field: "Session ID Missing",
                message: req.sessionID
            };
            res.status(400).json({ logs });
        }
        else {
            req.session.destroy((err) => {
                if (err) {
                    console.log(err);
                    logs = [
                        {
                            field: "Unknown Error Occurred",
                            message: "Better check with administrator",
                        }
                    ];
                    res.status(400).json({ logs });
                    ;
                }
            });
            logs = {
                field: "Log Out Successful",
                message: "Cleared"
            };
            res.status(200).json({ logs });
        }
    }
    catch (e) {
        res.status(400).json({ e });
        throw e;
    }
};
const loginAdmin = async (req, res) => {
    const db = await connection_1.connection.getDb();
    const collection = db.collection('admin');
    try {
        let result;
        let logs;
        const admin = req.body;
        try {
            result = await collection.findOne({
                _id: admin._id
            });
            console.log(result);
        }
        catch (err) {
            if (err instanceof mongodb_1.MongoServerError && err.code === 11000) {
                console.error("# Duplicate Data Found:\n", err);
                logs = [{
                        field: "ID Error",
                        message: "That ID doesn't exist",
                    }];
                res.status(400).json({ logs });
                return { logs };
            }
            else {
                res.status(400).json({ err });
                throw new Error(err);
            }
        }
        const valid = await argon2_1.default.verify(result.adminPassword, admin.adminPassword);
        if (valid) {
            console.log(result);
            logs = [
                {
                    field: "Successful Log In",
                    message: req.sessionID,
                }
            ];
            res.status(200).json({ logs });
            return { logs };
        }
        else {
            logs = [
                {
                    field: "Password",
                    message: "Incorrect password",
                }
            ];
            res.status(400).json({ logs });
            return { logs };
        }
    }
    catch (e) {
        res.status(400).json({ e });
        throw e;
    }
};
const setQuery = async (req, res) => {
    const db = await connection_1.connection.getDb();
    const collection = db.collection('queries');
    try {
        const queryData = req.body;
        const _query = {
            queryEmail: queryData.queryEmail,
            queryText: queryData.queryText,
            queryResponse: '',
            querySolved: false
        };
        let result;
        let logs;
        try {
            result = await collection.insertOne(_query);
        }
        catch (err) {
            if (err instanceof mongodb_1.MongoServerError && err.code === 11000) {
                console.error("# Duplicate Data Found:\n", err);
                logs = [{
                        field: "Unexpected Mongo Error",
                        message: "Default Message"
                    }];
                res.status(400).json({ logs });
                return { logs };
            }
            else {
                res.status(400).json({ err });
                throw new Error(err);
            }
        }
        console.log(result);
        if (result.acknowledged) {
            console.log(result);
            logs = [
                {
                    field: "Successful Insertion",
                    message: "Done",
                }
            ];
            res.status(200).json({ logs });
            return { logs };
        }
        else {
            logs = [
                {
                    field: "Unknown Error Occurred",
                    message: "Better check with administrator",
                }
            ];
            res.status(400).json({ logs });
            return { logs };
        }
    }
    catch (e) {
        res.status(400).json({ e });
        throw e;
    }
};
const replyQuery = async (req, res) => {
    const db = await connection_1.connection.getDb();
    const collection = db.collection('queries');
    console.log(req.body);
    try {
        const queryData = req.body;
        const queryId = req.params.id;
        const _query = {
            _id: new mongoose_1.default.Types.ObjectId(queryId),
            queryResponse: queryData.queryResponse,
        };
        console.log(_query._id);
        let result;
        let logs;
        try {
            result = await collection.updateOne({ _id: _query._id }, { $set: { queryResponse: _query.queryResponse, querySolved: true } });
        }
        catch (err) {
            if (err instanceof mongodb_1.MongoServerError && err.code === 11000) {
                console.error("# Duplicate Data Found:\n", err);
                logs = [{
                        field: "Unexpected Mongo Error",
                        message: "Default Message"
                    }];
                res.status(400).json({ logs });
                return { logs };
            }
            else {
                res.status(400).json({ err });
                throw new Error(err);
            }
        }
        console.log(result);
        if (result.acknowledged) {
            console.log(result);
            logs = [
                {
                    field: "Successful Finding",
                    message: "Done",
                }
            ];
            res.status(200).json({ logs });
            return { logs };
        }
        else {
            logs = [
                {
                    field: "Unknown Error Occurred",
                    message: "Better check with administrator",
                }
            ];
            res.status(400).json({ logs });
            return { logs };
        }
    }
    catch (e) {
        res.status(400).json({ e });
        throw e;
    }
};
const setToken = async (req, res) => {
    const db = await connection_1.connection.getDb();
    const collection = db.collection('tokens');
    try {
        const tokenName = req.body.tokenName;
        const tokenSymbol = req.body.tokenSymbol;
        const tokenDescription = req.body.tokenDescription;
        const _token = {
            tokenName: tokenName,
            tokenSymbol: tokenSymbol,
            tokenDescription: tokenDescription,
        };
        let result;
        let logs;
        try {
            result = await collection.insertOne(_token);
        }
        catch (err) {
            if (err instanceof mongodb_1.MongoServerError && err.code === 11000) {
                console.error("# Duplicate Data Found:\n", err);
                logs = [{
                        field: "Unexpected Mongo Error",
                        message: "Default Message"
                    }];
                res.status(400).json({ logs });
                return { logs };
            }
            else {
                res.status(400).json({ err });
                throw new Error(err);
            }
        }
        console.log(result);
        if (result.acknowledged) {
            console.log(result);
            logs = [
                {
                    field: "Successful Insertion",
                    message: "Admin Token",
                }
            ];
            res.status(200).json({ logs });
            return { logs };
        }
        else {
            logs = [
                {
                    field: "Unknown Error Occurred",
                    message: "Better check with administrator",
                }
            ];
            res.status(400).json({ logs });
            return { logs };
        }
    }
    catch (e) {
        res.status(400).json({ e });
        throw e;
    }
};
const deleteToken = async (req, res) => {
    const db = await connection_1.connection.getDb();
    const collection = db.collection('tokens');
    console.log(req.body);
    try {
        const tokenId = (req.body.tokenId).toString();
        let result;
        let logs;
        try {
            result = await collection.deleteOne({ _id: new mongoose_1.default.Types.ObjectId(tokenId) });
        }
        catch (err) {
            if (err instanceof mongodb_1.MongoServerError && err.code === 11000) {
                console.error("# Duplicate Data Found:\n", err);
                logs = [{
                        field: "Unexpected Mongo Error",
                        message: "Default Message"
                    }];
                res.status(400).json({ logs });
                return { logs };
            }
            else {
                res.status(400).json({ err });
                throw new Error(err);
            }
        }
        console.log(result);
        if (result.acknowledged) {
            console.log(result);
            logs = [
                {
                    field: "Successful Deletion",
                    message: "Token",
                }
            ];
            res.status(200).json({ logs });
            return { logs };
        }
        else {
            logs = [
                {
                    field: "Unknown Error Occurred",
                    message: "Better check with administrator",
                }
            ];
            res.status(400).json({ logs });
            return { logs };
        }
    }
    catch (e) {
        res.status(400).json({ e });
        throw e;
    }
};
const getQuery = async (req, res) => {
    const db = await connection_1.connection.getDb();
    const collection = db.collection('queries');
    try {
        let result;
        let logs;
        const queryId = req.params.id;
        const _query = {
            _id: new mongoose_1.default.Types.ObjectId(queryId),
        };
        try {
            result = await collection.find({ _id: _query._id }, { projection: { _id: 1, queryEmail: 1, queryText: 1, queryResponse: 1 } }).toArray();
        }
        catch (err) {
            if (err instanceof mongodb_1.MongoServerError && err.code === 11000) {
                console.error("# Duplicate Data Found:\n", err);
                logs = [{
                        field: "Unexpected Mongo Error",
                        message: "Default Message"
                    }];
                res.status(400).json({ logs });
                return { logs };
            }
            else {
                res.status(400).json({ err });
                throw new Error(err);
            }
        }
        if (result) {
            logs = [
                {
                    field: "Successful Retrieval",
                    message: "Done",
                }
            ];
            res.status(200).json({ result });
            return { logs };
        }
        else {
            logs = [
                {
                    field: "Unknown Error Occurred",
                    message: "Better check with administrator",
                }
            ];
            res.status(400).json({ logs });
            return { logs };
        }
    }
    catch (e) {
        res.status(400).json({ e });
        throw e;
    }
};
module.exports = {
    getAdminQueries, loginAdmin, setQuery, replyQuery, getQuery, getAdminSession, logoutAdmin, getAdminTokens, deleteToken, setToken
};
//# sourceMappingURL=AdminController.js.map