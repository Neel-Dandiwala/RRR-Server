"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Company_1 = __importDefault(require("../models/Company"));
const validation_1 = require("../utils/validation");
const argon2_1 = __importDefault(require("argon2"));
const connection_1 = require("../connection");
const CredentialsInput_1 = require("../utils/CredentialsInput");
const mongodb_1 = require("mongodb");
const web3_1 = require("../web3");
const axios_1 = __importDefault(require("axios"));
require('dotenv').config();
class CompanyResponse {
}
const getCompanies = async (req, res) => {
    const db = await connection_1.connection.getDb();
    const collection = db.collection('company');
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
const setCompany = async (req, res) => {
    const db = await connection_1.connection.getDb();
    const collection = db.collection('company');
    try {
        const companyData = req.body;
        console.log(companyData);
        let credentials = new CredentialsInput_1.CredentialsInput();
        credentials.email = companyData.companyEmail;
        credentials.username = companyData.companyName;
        credentials.password = companyData.companyPassword;
        let logs = (0, validation_1.validation)(credentials);
        if (logs) {
            res.status(400).json({ logs });
            return { logs };
        }
        const hashedPassword = await argon2_1.default.hash(credentials.password);
        const _company = new Company_1.default({
            companyName: companyData.companyName,
            companyEmail: companyData.companyEmail,
            companyPassword: hashedPassword,
            companyPaperPrice: companyData.companyPaperPrice,
            companyPlasticPrice: companyData.companyPlasticPrice,
            companyElectronicPrice: companyData.companyElectronicPrice,
            companyAddress: companyData.companyAddress,
            companyCity: companyData.companyCity,
            companyState: companyData.companyState,
            companyPincode: companyData.companyPincode,
            companyMobile: companyData.companyMobile
        });
        let geoLocationResponse;
        var API_KEY = process.env.LOCATIONIQ_API_KEY;
        var BASE_URL = "https://us1.locationiq.com/v1/search?format=json&limit=1";
        let address = _company.companyAddress + ' ' + _company.companyPincode;
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
                    field: "Company LocationIQ Error",
                    message: "Better check with administrator",
                }
            ];
            res.status(400).json({ logs });
            return;
        }
        else {
            console.log(geoLocationResponse);
            console.log(typeof geoLocationResponse);
            _company.companyLatitude = geoLocationResponse.lat * 1;
            _company.companyLongitude = geoLocationResponse.lon * 1;
        }
        let result;
        try {
            result = await collection.insertOne(_company);
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
            validationContract.methods.addCompany(result.insertedId.toString()).send({ from: process.env.OWNER_ADDRESS, gasPrice: '3000000' })
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
const validationCompany = async (req, res) => {
    const key = req.body.key;
    console.log(req.body);
    let logs;
    var validationContract = new (web3_1.web3.getWeb3()).eth.Contract(web3_1.ValidationABI.abi, process.env.VALIDATION_ADDRESS, {});
    await validationContract.methods.validateCompany(key).send({ from: process.env.OWNER_ADDRESS, gasPrice: '3000000' })
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
const updateCompany = async (res) => {
    res.status(200).json({ message: 'company Update' });
};
const deleteCompany = async (res) => {
    res.status(200).json({ message: 'company Delete' });
};
module.exports = {
    getCompanies, setCompany, updateCompany, deleteCompany, validationCompany
};
//# sourceMappingURL=CompanyController.js.map