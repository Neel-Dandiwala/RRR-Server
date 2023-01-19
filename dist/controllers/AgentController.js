"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Agent_1 = __importDefault(require("../models/Agent"));
const validation_1 = require("../utils/validation");
const argon2_1 = __importDefault(require("argon2"));
const connection_1 = require("../connection");
const CredentialsInput_1 = require("../utils/CredentialsInput");
const mongodb_1 = require("mongodb");
const web3_1 = require("../web3");
const axios_1 = __importDefault(require("axios"));
const searchNearby_1 = require("../utils/searchNearby");
const mongoose_1 = __importDefault(require("mongoose"));
require('dotenv').config();
class AgentResponse {
}
const getAgents = async (req, res) => {
    const db = await connection_1.connection.getDb();
    const collection = db.collection('agent');
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
const setAgent = async (req, res) => {
    const db = await connection_1.connection.getDb();
    const collection = db.collection('agent');
    try {
        const agentData = req.body;
        console.log(agentData);
        let credentials = new CredentialsInput_1.CredentialsInput();
        credentials.email = agentData.agentEmail;
        credentials.username = agentData.agentName;
        credentials.password = agentData.agentPassword;
        let logs = (0, validation_1.validation)(credentials);
        if (logs) {
            res.status(400).json({ logs });
            return { logs };
        }
        const hashedPassword = await argon2_1.default.hash(credentials.password);
        const _agent = new Agent_1.default({
            agentName: agentData.agentName,
            agentEmail: agentData.agentEmail,
            agentPassword: hashedPassword,
            agentAge: agentData.agentAge,
            agentMobile: agentData.agentMobile,
            agentCity: agentData.agentCity,
            agentState: agentData.agentState,
            agentPincode: agentData.agentPincode,
            agentAddress: agentData.agentAddress,
            agentLatitude: '',
            agentLongitude: ''
        });
        let geoLocationResponse;
        var API_KEY = process.env.LOCATIONIQ_API_KEY;
        var BASE_URL = "https://us1.locationiq.com/v1/search?format=json&limit=1";
        let address = _agent.agentAddress + ' ' + _agent.agentPincode;
        var url = BASE_URL + "&key=" + API_KEY + "&q=" + address;
        let config = {
            method: 'get',
            url: url,
            headers: {}
        };
        await (0, axios_1.default)(config).then(function (response) {
            console.log(response.data[0]);
            geoLocationResponse = response.data[0];
        }).catch(function (error) {
            console.log(error);
            geoLocationResponse = null;
        });
        if (geoLocationResponse === null) {
            logs = [
                {
                    field: "LocationIQ Error",
                    message: "Better check with administrator",
                }
            ];
            res.status(400).json({ logs });
            return;
        }
        else {
            console.log(geoLocationResponse);
            console.log(typeof geoLocationResponse);
            _agent.agentLatitude = geoLocationResponse.lat * 1;
            _agent.agentLongitude = geoLocationResponse.lon * 1;
        }
        let result;
        try {
            result = await collection.insertOne(_agent);
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
            validationContract.methods.addAgent(result.insertedId.toString()).send({ from: process.env.OWNER_ADDRESS, gasPrice: '3000000' })
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
const validationAgent = async (req, res) => {
    const key = req.body.key;
    console.log(req.body);
    let logs;
    var validationContract = new (web3_1.web3.getWeb3()).eth.Contract(web3_1.ValidationABI.abi, process.env.VALIDATION_ADDRESS, {});
    await validationContract.methods.validateAgent(key).send({ from: process.env.OWNER_ADDRESS, gasPrice: '3000000' })
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
const getNearbyCompanies = async (req, res) => {
    const db = await connection_1.connection.getDb();
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
                field: "Blockchain Error - Validation",
                message: err,
            }
        ];
        res.status(400).json({ logs });
        return;
    });
    if (validAgent) {
        try {
            const searchAgent = db.collection('agent');
            let _agent = await searchAgent.findOne({ _id: new mongoose_1.default.Types.ObjectId(req.session.authenticationID) });
            const lat = _agent.agentLatitude;
            const lon = _agent.agentLongitude;
            const collection = db.collection('company');
            let result;
            let _companies = [];
            result = await collection.find({}).toArray();
            result.forEach(function (company) {
                console.log(company);
                let _distance = (0, searchNearby_1.calculateDistance)(lat, lon, company.companyLatitude, company.companyLongitude);
                console.log(_distance);
                if (_distance <= 5.0) {
                    console.log("Distance is good");
                    if (_companies.length < 10) {
                        let _company = {
                            companyName: company.companyName,
                            companyEmail: company.companyEmail,
                            companyPaperPrice: company.companyPaperPrice,
                            companyPlasticPrice: company.companyPlasticPrice,
                            companyElectronicPrice: company.companyElectronicPrice,
                            companyMobile: company.companyMobile,
                            companyAddress: company.companyAddress,
                            companyCity: company.companyCity,
                            companyState: company.companyState,
                            companyPincode: company.companyState,
                            companyLatitude: company.companyLatitude,
                            companyLongitude: company.companyLongitude,
                        };
                        _companies.push({
                            company: _company,
                            distance: _distance
                        });
                    }
                    else {
                        for (let i = 0; i < 10; i++) {
                            if (_distance < _companies[i].distance) {
                                _companies[i] = {
                                    company: company,
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
            res.status(200).json({ _companies });
            return _companies;
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
                field: "Invalid Agent",
                message: "Better check with administrator",
            }
        ];
        res.status(400).json({ logs });
        return;
    }
};
const getAgentBookings = async (req, res) => {
    const db = await connection_1.connection.getDb();
    const collection = db.collection('user_agent_booking');
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
    await validationContract.methods.validateAgent(req.session.authenticationID).send({ from: process.env.OWNER_ADDRESS, gasPrice: '3000000' })
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
            let _bookings = [];
            try {
                result = await collection.find({ bookingAgent: req.session.authenticationID }).toArray();
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
            for (const booking of result) {
                const userCollection = db.collection('user');
                let _user;
                try {
                    _user = await userCollection.findOne({ _id: new mongoose_1.default.Types.ObjectId(booking.bookingUser) });
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
                let _booking = {
                    bookingId: booking._id,
                    bookingUser: booking.bookingUser,
                    bookingAgent: booking.bookingAgent,
                    bookingUserName: _user.userName,
                    bookingDate: booking.bookingDate,
                    bookingTimeSlot: booking.bookingTimeSlot,
                    bookingAddress: booking.bookingAddress,
                    bookingPincode: booking.bookingPincode,
                    bookingStatus: booking.bookingStatus,
                };
                console.log(_booking);
                _bookings.push(_booking);
            }
            ;
            console.log(_bookings);
            res.status(200).json(_bookings);
            return _bookings;
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
                field: "Invalid Agent",
                message: "Better check with administrator",
            }
        ];
        res.status(400).json({ logs });
        return;
    }
};
const agentRejectBooking = async (req, res) => {
    const bookingId = req.body.key;
    const db = await connection_1.connection.getDb();
    const collection = db.collection('user_agent_booking');
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
    let result;
    try {
        result = await collection.findOne({ _id: new mongoose_1.default.Types.ObjectId(bookingId) });
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
    if (result.bookingAgent !== req.session.authenticationID) {
        logs = [
            {
                field: "Invalid Agent",
                message: "Better check with administrator",
            }
        ];
        res.status(400).json({ logs });
        return;
    }
    try {
        await collection.updateOne({ _id: new mongoose_1.default.Types.ObjectId(bookingId) }, { $set: { bookingStatus: 'Rejected' } });
        logs = {
            field: "Succesful Updation",
            message: "Booking Rejected by Agent"
        };
        res.status(200).json(logs);
        return { logs };
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
};
const agentAcceptBooking = async (req, res) => {
    const bookingId = req.body.key;
    const db = await connection_1.connection.getDb();
    const collection = db.collection('user_agent_booking');
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
    let result;
    try {
        result = await collection.findOne({ _id: new mongoose_1.default.Types.ObjectId(bookingId) });
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
    if (result.bookingAgent !== req.session.authenticationID) {
        logs = [
            {
                field: "Invalid Agent",
                message: "Better check with administrator",
            }
        ];
        res.status(400).json({ logs });
        return;
    }
    try {
        await collection.updateOne({ _id: new mongoose_1.default.Types.ObjectId(bookingId) }, { $set: { bookingStatus: 'Accepted' } });
        logs = {
            field: "Succesful Updation",
            message: "Booking Accepted by Agent"
        };
        res.status(200).json(logs);
        return { logs };
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
};
const updateAgent = async (res) => {
    res.status(200).json({ message: 'agent Update' });
};
const deleteAgent = async (res) => {
    res.status(200).json({ message: 'agent Delete' });
};
module.exports = {
    getAgents, setAgent, updateAgent, deleteAgent, validationAgent, getNearbyCompanies, getAgentBookings, agentRejectBooking, agentAcceptBooking
};
//# sourceMappingURL=AgentController.js.map