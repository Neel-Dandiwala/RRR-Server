"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const connection_1 = require("../connection");
const mongodb_1 = require("mongodb");
const web3_1 = require("../web3");
const mongoose_1 = __importDefault(require("mongoose"));
const Token_1 = __importDefault(require("../models/Token"));
require('dotenv').config();
const rewardTransferFrom = async (req, res) => {
    const bookingId = req.body.key;
    const db = await connection_1.connection.getDb();
    const collection = db.collection('waste');
    let logs;
    if (!req.session.authenticationID) {
        logs = [
            {
                field: "Not logged in",
                message: "Please log in",
            }
        ];
        res.status(400).json({ logs });
        return;
    }
    let validAgent = false;
    var validationContract = new (web3_1.web3.getWeb3()).eth.Contract(web3_1.ValidationABI.abi, process.env.VALIDATION_ADDRESS, {});
    await validationContract.methods.validateAgent(req.session.authenticationID).send({ from: process.env.OWNER_ADDRESS, gasPrice: '3000000' })
        .then(function (blockchain_result) {
        console.log(blockchain_result);
        validAgent = true;
    }).catch((err) => {
        console.log(err);
        logs = [
            {
                field: "Blockchain Error - Agent Validation",
                message: err,
            }
        ];
        res.status(400).json({ logs });
        return;
    });
    console.log(validAgent);
    if (validAgent) {
        try {
            const bookingCollection = db.collection('agent_company_booking');
            let bookingData;
            try {
                bookingData = await bookingCollection.findOne({ _id: new mongoose_1.default.Types.ObjectId(bookingId) });
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
            if (bookingData === null) {
                logs =
                    {
                        field: "Invalid Booking Id",
                        message: "Better check with administrator",
                    };
                res.status(400).json({ logs });
                return;
            }
            for (const wasteId of bookingData.wasteIds) {
                let wasteData;
                try {
                    wasteData = await collection.findOne({ _id: new mongoose_1.default.Types.ObjectId(wasteId) });
                    if (wasteData.wasteAgent !== req.session.authenticationID) {
                        logs = [
                            {
                                field: "Invalid Agent",
                                message: "Waste specifies another Agent",
                            }
                        ];
                        res.status(400).json({ logs });
                        return;
                    }
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
                console.log(wasteData);
                try {
                    var validationContract = new (web3_1.web3.getWeb3()).eth.Contract(web3_1.ValidationABI.abi, process.env.VALIDATION_ADDRESS, {});
                    await validationContract.methods.validateUser(wasteData.wasteUser).send({ from: process.env.OWNER_ADDRESS, gasPrice: '3000000' })
                        .then(function (blockchain_result) {
                        console.log(blockchain_result);
                    }).catch((err) => {
                        console.log(err);
                        logs = [
                            {
                                field: "Blockchain Error - User Validation",
                                message: err,
                            }
                        ];
                        res.status(400).json({ logs });
                        return;
                    });
                }
                catch (err) {
                    logs = [
                        {
                            field: "Blockchain Error",
                            message: err,
                        }
                    ];
                    res.status(400).json({ logs });
                    return;
                }
                let amount = parseInt(wasteData.wasteWeight);
                var rewardContract = new (web3_1.web3.getWeb3()).eth.Contract(web3_1.RewardABI.abi, process.env.REWARD_ADDRESS, {});
                await rewardContract.methods.transferFrom(wasteData.wasteAgent, wasteData.wasteUser, amount).send({ from: process.env.OWNER_ADDRESS, gas: '1000000', gasPrice: '3000000' })
                    .then(function (blockchain_result) {
                    console.log(blockchain_result);
                }).catch((err) => {
                    console.log(err);
                    logs = [
                        {
                            field: "Blockchain Error - TransferFrom",
                            message: err,
                        }
                    ];
                    res.status(400).json({ logs });
                    return;
                });
            }
            logs = [
                {
                    field: "Successful TransferFrom",
                    message: "All rewards imbursed",
                }
            ];
            res.status(200).json({ logs });
            return;
        }
        catch (e) {
            res.status(400).json({ e });
            throw e;
        }
    }
    else {
        logs = [
            {
                field: "Invalid Agent",
                message: "Better check with administrator",
            }
        ];
        res.status(400).json({ logs });
        return;
    }
};
const rewardMint = async (req, res) => {
    const bookingId = req.body.key;
    const db = await connection_1.connection.getDb();
    const collection = db.collection('waste');
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
    let validCompany = false;
    var validationContract = new (web3_1.web3.getWeb3()).eth.Contract(web3_1.ValidationABI.abi, process.env.VALIDATION_ADDRESS, {});
    await validationContract.methods.validateCompany(req.session.authenticationID).send({ from: process.env.OWNER_ADDRESS, gasPrice: '3000000' })
        .then(function (blockchain_result) {
        console.log(blockchain_result);
        validCompany = true;
    }).catch((err) => {
        console.log(err);
        logs = [
            {
                field: "Blockchain Error - Company Validation",
                message: err,
            }
        ];
        res.status(400).json({ logs });
        return;
    });
    if (validCompany) {
        try {
            const bookingCollection = db.collection('agent_company_booking');
            let bookingData;
            try {
                bookingData = await bookingCollection.findOne({ _id: new mongoose_1.default.Types.ObjectId(bookingId) });
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
            if (bookingData === null) {
                logs =
                    {
                        field: "Invalid Booking Id",
                        message: "Better check with administrator",
                    };
                res.status(400).json({ logs });
                return;
            }
            for (const wasteId of bookingData.wasteIds) {
                let wasteData;
                try {
                    wasteData = await collection.findOne({ _id: new mongoose_1.default.Types.ObjectId(wasteId) });
                    if (wasteData.wasteCompany !== req.session.authenticationID) {
                        logs = [
                            {
                                field: "Invalid Company",
                                message: "Better check with log in",
                            }
                        ];
                        res.status(400).json({ logs });
                        return;
                    }
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
                console.log(wasteData);
                try {
                    var validationContract = new (web3_1.web3.getWeb3()).eth.Contract(web3_1.ValidationABI.abi, process.env.VALIDATION_ADDRESS, {});
                    await validationContract.methods.validateAgent(wasteData.wasteAgent).send({ from: process.env.OWNER_ADDRESS, gasPrice: '3000000' })
                        .then(function (blockchain_result) {
                        console.log(blockchain_result);
                    }).catch((err) => {
                        console.log(err);
                        logs = [
                            {
                                field: "Blockchain Error - Agent Validation",
                                message: err,
                            }
                        ];
                        res.status(400).json({ logs });
                        return;
                    });
                }
                catch (err) {
                    logs = [
                        {
                            field: "Blockchain Error",
                            message: err,
                        }
                    ];
                    res.status(400).json({ logs });
                    return;
                }
                let amount = parseInt(wasteData.wasteWeight);
                var rewardContract = new (web3_1.web3.getWeb3()).eth.Contract(web3_1.RewardABI.abi, process.env.REWARD_ADDRESS, {});
                await rewardContract.methods._mint(wasteData.wasteAgent, amount).send({ from: process.env.OWNER_ADDRESS, gasPrice: '3000000' })
                    .then(function (blockchain_result) {
                    console.log(blockchain_result);
                }).catch((err) => {
                    console.log(err);
                    logs = [
                        {
                            field: "Blockchain Error - _Mint",
                            message: err,
                        }
                    ];
                    res.status(400).json({ logs });
                    return;
                });
            }
            logs = [
                {
                    field: "Successful Mint",
                    message: "All rewards imbursed now",
                }
            ];
            res.status(200).json({ logs });
            return;
        }
        catch (e) {
            res.status(400).json({ e });
            throw e;
        }
    }
    else {
        logs = [
            {
                field: "Invalid Company",
                message: "Better check with administrator",
            }
        ];
        res.status(400).json({ logs });
        return;
    }
};
const rewardBurn = async (req, res) => {
};
const rewardMintToken = async (req, res) => {
    const db = await connection_1.connection.getDb();
    const collection = db.collection('token');
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
            const tokenData = req.body;
            console.log(tokenData);
            const _token = new Token_1.default({
                tokenId: '',
                tokenUserId: req.session.authenticationID,
                tokenName: tokenData.tokenName,
                tokenSymbol: tokenData.tokenSymbol,
                tokenExpires: '',
                tokenUsed: false,
                tokenAmount: tokenData.tokenAmount
            });
            let result;
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
                var rewardContract = new (web3_1.web3.getWeb3()).eth.Contract(web3_1.RewardABI.abi, process.env.REWARD_ADDRESS, {});
                await rewardContract.methods.mintToken(req.session.authenticationID, tokenData.tokenName, tokenData.tokenSymbol, tokenData.tokenAmount).send({ from: process.env.OWNER_ADDRESS, gas: '1000000', gasPrice: '3000000' })
                    .then(async function (blockchain_result) {
                    console.log(blockchain_result);
                    let _tokenExpires = (blockchain_result.events.TokenEvent.returnValues.expires).toString();
                    let _tokenId = (blockchain_result.events.TokenEvent.returnValues.id).toString();
                    let updatedToken = await collection.updateOne({ _id: result.insertedId }, { $set: { tokenId: _tokenId, tokenExpires: _tokenExpires } });
                    if (updatedToken.acknowledged) {
                        logs = [
                            {
                                field: "Successful Updation",
                                message: blockchain_result,
                            }
                        ];
                        res.status(200).json({ logs });
                        return { logs };
                    }
                    else {
                        logs = [
                            {
                                field: "Mongo Error",
                                message: blockchain_result,
                            }
                        ];
                        res.status(400).json({ logs });
                        return { logs };
                    }
                    res.status(200).json({ logs });
                    return { logs };
                }).catch(async (err) => {
                    console.log(err);
                    let deleted = await collection.deleteOne({ _id: result.insertedId });
                    if (deleted.acknowledged) {
                        logs = [
                            {
                                field: "Blockchain Error - Token Insertion",
                                message: err,
                            }
                        ];
                        res.status(400).json({ logs });
                        return;
                    }
                    else {
                        logs = [
                            {
                                field: "Blockchain Error and MongoDB Error",
                                message: err,
                            }
                        ];
                        res.status(400).json({ logs });
                        return;
                    }
                });
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
const rewardBurnToken = async (req, res) => {
    const db = await connection_1.connection.getDb();
    const collection = db.collection('token');
    const key = req.body.key;
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
            let tokenData;
            try {
                tokenData = await collection.findOne({ _id: new mongoose_1.default.Types.ObjectId(key) });
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
            console.log(tokenData);
            let tokenId = parseInt(tokenData.tokenId);
            var rewardContract = new (web3_1.web3.getWeb3()).eth.Contract(web3_1.RewardABI.abi, process.env.REWARD_ADDRESS, {});
            await rewardContract.methods.burnToken(req.session.authenticationID, tokenId).send({ from: process.env.OWNER_ADDRESS, gas: '1000000', gasPrice: '3000000' })
                .then(async function (blockchain_result) {
                console.log(blockchain_result);
                let updatedToken = await collection.updateOne({ _id: new mongoose_1.default.Types.ObjectId(key) }, { $set: { tokenUsed: true } });
                if (updatedToken.acknowledged) {
                    logs = [
                        {
                            field: "Successful Updation",
                            message: blockchain_result,
                        }
                    ];
                    res.status(200).json({ logs });
                    return { logs };
                }
                else {
                    logs = [
                        {
                            field: "Mongo Error",
                            message: blockchain_result,
                        }
                    ];
                    res.status(400).json({ logs });
                    return { logs };
                }
                res.status(200).json({ logs });
                return { logs };
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
        }
        catch (e) {
            res.status(400).json({ e });
            throw e;
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
module.exports = {
    rewardTransferFrom, rewardMint, rewardBurn, rewardMintToken, rewardBurnToken
};
//# sourceMappingURL=RewardController.js.map