"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const argon2_1 = __importDefault(require("argon2"));
const connection_1 = require("../connection");
const mongodb_1 = require("mongodb");
const loginEntity = async (req, res) => {
    const db = await connection_1.connection.getDb();
    try {
        let result;
        let logs;
        let collection;
        const loginEntity = req.body;
        let collectionName = (loginEntity.loginRole).toLowerCase();
        collection = db.collection((loginEntity.loginRole).toLowerCase());
        if (collectionName === 'user') {
            try {
                result = await collection.findOne({
                    userEmail: loginEntity.loginEmail
                });
                console.log(result);
            }
            catch (err) {
                if (err instanceof mongodb_1.MongoServerError && err.code === 11000) {
                    console.error("# Duplicate Data Found:\n", err);
                    logs = [{
                            field: "Entity Missing",
                            message: "That entity doesn't exist",
                        }];
                    res.status(400).json({ logs });
                    return { logs };
                }
                else {
                    res.status(400).json({ err });
                    throw new Error(err);
                }
            }
            const valid = await argon2_1.default.verify(result.userPassword, loginEntity.loginPassword);
            if (valid) {
                console.log(result);
                logs = [
                    {
                        field: "Successful Log In",
                        message: result.userName,
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
        else if (collectionName === 'agent') {
            try {
                result = await collection.findOne({
                    agentEmail: loginEntity.loginEmail
                });
                console.log(result);
            }
            catch (err) {
                if (err instanceof mongodb_1.MongoServerError && err.code === 11000) {
                    console.error("# Duplicate Data Found:\n", err);
                    logs = [{
                            field: "Entity Missing",
                            message: "That entity doesn't exist",
                        }];
                    res.status(400).json({ logs });
                    return { logs };
                }
                else {
                    res.status(400).json({ err });
                    throw new Error(err);
                }
            }
            const valid = await argon2_1.default.verify(result.agentPassword, loginEntity.loginPassword);
            if (valid) {
                console.log(result);
                logs = [
                    {
                        field: "Successful Log In",
                        message: result.agentName,
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
        else if (collectionName === 'company') {
            try {
                result = await collection.findOne({
                    companyEmail: loginEntity.loginEmail
                });
                console.log(result);
            }
            catch (err) {
                if (err instanceof mongodb_1.MongoServerError && err.code === 11000) {
                    console.error("# Duplicate Data Found:\n", err);
                    logs = [{
                            field: "Entity Missing",
                            message: "That entity doesn't exist",
                        }];
                    res.status(400).json({ logs });
                    return { logs };
                }
                else {
                    res.status(400).json({ err });
                    throw new Error(err);
                }
            }
            const valid = await argon2_1.default.verify(result.companyPassword, loginEntity.loginPassword);
            if (valid) {
                console.log(result);
                logs = [
                    {
                        field: "Successful Log In",
                        message: result.companyName,
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
    }
    catch (e) {
        res.status(400).json({ e });
        throw e;
    }
};
module.exports = {
    loginEntity
};
//# sourceMappingURL=LoginController.js.map