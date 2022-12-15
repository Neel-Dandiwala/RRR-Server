"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
class CompanyResponse {
}
const collection = connection_1.connection.db('rrrdatabase').collection('company');
const getCompanies = (res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let result;
        let logs;
        try {
            result = yield collection.find({}).toArray();
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
        result = JSON.stringify(result, null, 2);
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
});
const setCompany = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const companyData = req.body;
        console.log(companyData);
        let credentials = new CredentialsInput_1.CredentialsInput();
        credentials.email = companyData.companyEmail;
        credentials.username = companyData.companyName;
        credentials.password = companyData.companyPassword;
        let logs = (0, validation_1.validation)(credentials);
        if (logs) {
            return { logs };
        }
        const hashedPassword = yield argon2_1.default.hash(credentials.password);
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
        });
        let result;
        try {
            result = yield collection.insertOne(_company);
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
});
const updateCompany = (res) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(200).json({ message: 'company Update' });
});
const deleteCompany = (res) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(200).json({ message: 'company Delete' });
});
module.exports = {
    getCompanies, setCompany, updateCompany, deleteCompany
};
//# sourceMappingURL=CompanyController.js.map