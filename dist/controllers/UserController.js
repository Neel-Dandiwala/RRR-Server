"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = __importDefault(require("../models/User"));
const validation_1 = require("../utils/validation");
const argon2_1 = __importDefault(require("argon2"));
const connection_1 = require("../connection");
const CredentialsInput_1 = require("../utils/CredentialsInput");
const mongodb_1 = require("mongodb");
const web3_1 = require("../web3");
const searchNearby_1 = require("../utils/searchNearby");
require('dotenv').config();
class UserResponse {
}
const getUsers = async (req, res) => {
    const db = await connection_1.connection.getDb();
    const collection = db.collection('user');
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
            console.log(result);
            logs = [
                {
                    field: "Successful Extraction",
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
const setUser = async (req, res) => {
    console.log(req);
    const db = await connection_1.connection.getDb();
    const collection = db.collection('user');
    try {
        const userData = req.body;
        console.log(userData);
        let credentials = new CredentialsInput_1.CredentialsInput();
        credentials.email = userData.userEmail;
        credentials.username = userData.userName;
        credentials.password = userData.userPassword;
        let logs = (0, validation_1.validation)(credentials);
        if (logs) {
            res.status(400).json({ logs });
            return { logs };
        }
        const hashedPassword = await argon2_1.default.hash(userData.userPassword);
        const _user = new User_1.default({
            userName: userData.userName,
            userEmail: userData.userEmail,
            userPassword: hashedPassword,
            userAge: userData.userAge,
            userAddress: userData.userAddress,
            userPincode: userData.userPincode,
            userMobile: userData.userMobile,
            userCity: userData.userCity,
            userState: userData.userState,
        });
        let result;
        try {
            result = await collection.insertOne(_user);
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
            let validationContract = new (web3_1.web3.getWeb3()).eth.Contract(web3_1.ValidationABI.abi, process.env.VALIDATION_ADDRESS, {});
            validationContract.methods.addUser(result.insertedId.toString()).send({ from: process.env.OWNER_ADDRESS, gasPrice: '3000000' })
                .then(function (blockchain_result) {
                console.log(blockchain_result);
            }).catch((err) => {
                console.log(err);
                logs = [
                    {
                        field: "Blockchain Error",
                        message: err,
                    }
                ];
                res.status(400).json({ logs });
                return { logs };
            });
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
const validationUser = async (req, res) => {
    const key = req.body.key;
    console.log(req.body);
    let logs;
    var validationContract = new (web3_1.web3.getWeb3()).eth.Contract(web3_1.ValidationABI.abi, process.env.VALIDATION_ADDRESS, {});
    await validationContract.methods.validateUser(key).send({ from: process.env.OWNER_ADDRESS, gasPrice: '3000000' })
        .then(function (blockchain_result) {
        console.log(blockchain_result);
        res.status(200).json({ blockchain_result });
        return { blockchain_result };
    }).catch((err) => {
        console.log(err);
        logs = [
            {
                field: "Blockchain Error",
                message: err,
            }
        ];
        res.status(400).json({ logs });
        return { logs };
    });
};
const getNearbyAgents = async (req, res) => {
    const lat = req.body.lat;
    const lon = req.body.lon;
    const db = await connection_1.connection.getDb();
    const collection = db.collection('agent');
    let logs;
    if (!req.session.authenticationID) {
        logs = [
            {
                field: "Not logged in",
                message: "Please log in",
            }
        ];
        res.status(400).json({ logs });
        return null;
    }
    let validUser = false;
    var validationContract = new (web3_1.web3.getWeb3()).eth.Contract(web3_1.ValidationABI.abi, process.env.VALIDATION_ADDRESS, {});
    await validationContract.methods.validateUser(req.session.authenticationID).send({ from: process.env.OWNER_ADDRESS, gasPrice: '3000000' })
        .then(function (blockchain_result) {
        console.log(blockchain_result);
        validUser = true;
    }).catch((err) => {
        console.log(err);
        logs = [
            {
                field: "Blockchain Error - Validation",
                message: err,
            }
        ];
        res.status(400).json({ logs });
        return;
    });
    if (validUser) {
        try {
            let result;
            let _agents = [];
            result = await collection.find({}).toArray();
            result.forEach(function (agent) {
                console.log(agent);
                let _distance = (0, searchNearby_1.calculateDistance)(lat, lon, agent.agentLatitude, agent.agentLongitude);
                console.log(_distance);
                if (_distance <= 5.0) {
                    console.log("Distance is good");
                    if (_agents.length < 10) {
                        console.log("Hereeee");
                        _agents.push({
                            agent: agent,
                            distance: _distance
                        });
                    }
                    else {
                        for (let i = 0; i < 10; i++) {
                            if (_distance < _agents[i].distance) {
                                _agents[i] = {
                                    agent: agent,
                                    distance: _distance
                                };
                            }
                            else {
                                continue;
                            }
                        }
                    }
                }
            });
            res.status(200).json({ _agents });
            return _agents;
        }
        catch (e) {
            logs = [
                {
                    field: "Some Error",
                    message: e,
                }
            ];
            res.status(400).json({ logs });
            return null;
        }
    }
    else {
        logs = [
            {
                field: "Invalid User",
                message: "Better check with administrator",
            }
        ];
        res.status(400).json({ logs });
        return;
    }
};
const updateUser = async (res) => {
    res.status(200).json({ message: 'User Update' });
};
module.exports = {
    getUsers, setUser, updateUser, validationUser, getNearbyAgents
};
//# sourceMappingURL=UserController.js.map