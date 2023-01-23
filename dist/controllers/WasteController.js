"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Waste_1 = __importDefault(require("../models/Waste"));
const connection_1 = require("../connection");
const mongodb_1 = require("mongodb");
const web3_1 = require("../web3");
const mongoose_1 = __importDefault(require("mongoose"));
const ImgurUpload_1 = require("../utils/ImgurUpload");
const { QRCodeGeneratorFunction } = require("../controllers/QRController");
require("dotenv").config();
const wasteUser = async (req, res) => {
    const db = await connection_1.connection.getDb();
    let collection = db.collection("waste");
    let logs;
    if (!req.session.authenticationID) {
        logs = [
            {
                field: "Not logged in",
                message: "Please log in",
            },
        ];
        res.status(400).json({ logs });
        return null;
    }
    let validUser = false;
    const wasteData = req.body;
    console.log(wasteData);
    var validationContract = new (web3_1.web3.getWeb3().eth.Contract)(web3_1.ValidationABI.abi, process.env.VALIDATION_ADDRESS, {});
    await validationContract.methods
        .validateUser(wasteData.wasteUser)
        .send({ from: process.env.OWNER_ADDRESS, gasPrice: "3000000" })
        .then(function (blockchain_result) {
        console.log(blockchain_result);
        validUser = true;
    })
        .catch((err) => {
        console.log(err);
        logs = [
            {
                field: "Blockchain Error - Validation",
                message: err,
            },
        ];
        res.status(400).json({ logs });
        return;
    });
    if (validUser) {
        try {
            const _wasteWeight = wasteData.wasteElectronicWeight +
                wasteData.wastePaperWeight +
                wasteData.wastePlasticWeight;
            const _waste = new Waste_1.default({
                wasteDescription: "wasteElectronicWeight: " +
                    wasteData.wasteElectronicWeight +
                    ", wastePaperWeight: " +
                    wasteData.wastePaperWeight +
                    ", wastePlasticWeight: " +
                    wasteData.wastePlasticWeight,
                wasteWeight: _wasteWeight,
                wasteUser: wasteData.wasteUser,
                wasteUserDate: new Date(Date.now()).toISOString(),
                wasteAgent: req.session.authenticationID,
                wasteAgentDate: null,
                wasteCompany: "",
                wasteCompanyDate: null,
                wasteElectronicWeight: wasteData.wasteElectronicWeight,
                wastePaperWeight: wasteData.wastePaperWeight,
                wastePlasticWeight: wasteData.wastePlasticWeight,
                wasteBookingId: wasteData.wasteBookingId
            });
            let result;
            try {
                result = await collection.insertOne(_waste);
            }
            catch (err) {
                if (err instanceof mongodb_1.MongoServerError && err.code === 11000) {
                    console.error("# Duplicate Data Found:\n", err);
                    logs = [
                        {
                            field: "Unexpected Mongo Error",
                            message: "Default Message",
                        },
                    ];
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
                var trackingContract = new (web3_1.web3.getWeb3().eth.Contract)(web3_1.TrackingABI.abi, process.env.TRACKING_ADDRESS, {});
                let id_ = result.insertedId.toString();
                let description_ = _waste.wasteDescription;
                console.log(description_);
                let weight_ = _wasteWeight.toString();
                let user_ = wasteData.wasteUser;
                await trackingContract.methods
                    .creationWaste(id_, description_, weight_, user_)
                    .send({
                    from: process.env.OWNER_ADDRESS,
                    gas: "1000000",
                    gasPrice: "3000000",
                })
                    .then(async function (blockchain_result) {
                    console.log(blockchain_result);
                    let userCollection = db.collection("user");
                    let agentCollection = db.collection("agent");
                    let _user = await userCollection.findOne({ _id: new mongoose_1.default.Types.ObjectId(wasteData.wasteUser) });
                    let _agent = await agentCollection.findOne({ _id: new mongoose_1.default.Types.ObjectId(_waste.wasteAgent) });
                    logs =
                        {
                            field: "Successful Insertion",
                            wasteId: id_,
                            wasteWeight: _wasteWeight,
                            wasteUser: wasteData.wasteUser,
                            wasteUserName: _user.userName,
                            wasteUserDate: _waste.wasteUserDate,
                            wasteAgent: _waste.wasteAgent,
                            wasteAgentName: _agent.agentName,
                            wasteAgentDate: _waste.wasteAgentDate,
                            wasteCompany: _waste.wasteCompany,
                            wasteCompanyDate: _waste.wasteCompanyDate,
                            wasteElectronicWeight: wasteData.wasteElectronicWeight,
                            wastePaperWeight: wasteData.wastePaperWeight,
                            wastePlasticWeight: wasteData.wastePlasticWeight,
                            wasteBookingId: wasteData.wasteBookingId
                        };
                    res.status(200).json(logs);
                    return { logs };
                })
                    .catch(async (err) => {
                    console.log(err);
                    let deleted = await collection.deleteOne({
                        _id: result.insertedId,
                    });
                    if (deleted.acknowledged) {
                        logs = [
                            {
                                field: "Blockchain Error - Waste Insertion",
                                message: err,
                            },
                        ];
                        res.status(400).json({ logs });
                        return;
                    }
                    else {
                        logs = [
                            {
                                field: "Blockchain Error and MongoDB Error",
                                message: err,
                            },
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
                    },
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
                field: "Invalid User Submitted",
                message: "Better check with administrator",
            },
        ];
        res.status(400).json({ logs });
        return;
    }
};
const wasteAgent = async (req, res) => {
    const db = await connection_1.connection.getDb();
    const collection = db.collection("waste");
    let logs;
    if (!req.session.authenticationID) {
        logs = [
            {
                field: "Not logged in",
                message: "Please log in",
            },
        ];
        res.status(400).json({ logs });
        return null;
    }
    let validAgent = false;
    var validationContract = new (web3_1.web3.getWeb3().eth.Contract)(web3_1.ValidationABI.abi, process.env.VALIDATION_ADDRESS, {});
    await validationContract.methods
        .validateAgent(req.session.authenticationID)
        .send({ from: process.env.OWNER_ADDRESS, gasPrice: "3000000" })
        .then(function (blockchain_result) {
        console.log(blockchain_result);
        validAgent = true;
    })
        .catch((err) => {
        console.log(err);
        logs = [
            {
                field: "Blockchain Error - Validation",
                message: err,
            },
        ];
        res.status(400).json({ logs });
        return;
    });
    if (validAgent) {
        try {
            const wasteId = req.body.key;
            let _waste = await collection.findOne({ _id: new mongoose_1.default.Types.ObjectId(wasteId) });
            if (_waste.wasteAgent !== req.session.authenticationID) {
                logs =
                    {
                        field: "Invalid Agent",
                        message: "Better check with administrator",
                    };
                res.status(400).json({ logs });
                return;
            }
            var trackingContract = new (web3_1.web3.getWeb3().eth.Contract)(web3_1.TrackingABI.abi, process.env.TRACKING_ADDRESS, {});
            let agent_ = req.session.authenticationID;
            await trackingContract.methods
                .agentOwnWaste(agent_, wasteId)
                .send({
                from: process.env.OWNER_ADDRESS,
                gas: "1000000",
                gasPrice: "3000000",
            })
                .then(async function (blockchain_result) {
                console.log(blockchain_result);
                let updatedAgent = await collection.updateOne({ _id: new mongoose_1.default.Types.ObjectId(wasteId) }, {
                    $set: {
                        wasteAgentDate: new Date(Date.now()).toISOString(),
                    },
                });
                if (updatedAgent.acknowledged) {
                    let _waste = await collection.findOne({ _id: new mongoose_1.default.Types.ObjectId(wasteId) });
                    res.status(200).json(_waste.wasteAgentDate);
                    return;
                }
                else {
                    logs = [
                        {
                            field: "Mongo Error",
                            message: blockchain_result,
                        },
                    ];
                    res.status(400).json({ logs });
                    return { logs };
                }
            })
                .catch((err) => {
                console.log(err);
                logs = [
                    {
                        field: "Blockchain Error - Waste Updation",
                    },
                ];
                res.status(400).json({ logs });
                return;
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
                field: "Invalid Agent",
                message: "Better check with administrator",
            },
        ];
        res.status(400).json({ logs });
        return;
    }
};
const wasteCompany = async (req, res) => {
    const db = await connection_1.connection.getDb();
    const collection = db.collection("waste");
    let logs;
    if (!req.session.authenticationID) {
        logs = [
            {
                field: "Not logged in",
                message: "Please log in",
            },
        ];
        res.status(400).json({ logs });
        return null;
    }
    let validCompany = false;
    var validationContract = new (web3_1.web3.getWeb3().eth.Contract)(web3_1.ValidationABI.abi, process.env.VALIDATION_ADDRESS, {});
    await validationContract.methods
        .validateCompany(req.session.authenticationID)
        .send({ from: process.env.OWNER_ADDRESS, gasPrice: "3000000" })
        .then(function (blockchain_result) {
        console.log(blockchain_result);
        validCompany = true;
    })
        .catch((err) => {
        console.log(err);
        logs = [
            {
                field: "Blockchain Error - Validation",
                message: err,
            },
        ];
        res.status(400).json({ logs });
        return;
    });
    if (validCompany) {
        try {
            const wasteId = req.body.id;
            var trackingContract = new (web3_1.web3.getWeb3().eth.Contract)(web3_1.TrackingABI.abi, process.env.TRACKING_ADDRESS, {});
            let company_ = req.session.authenticationID;
            console.log(company_ + typeof company_);
            await trackingContract.methods
                .companyOwnWaste(company_, wasteId)
                .send({
                from: process.env.OWNER_ADDRESS,
                gas: "1000000",
                gasPrice: "3000000",
            })
                .then(async function (blockchain_result) {
                console.log(blockchain_result);
                let updatedCompany = await collection.updateOne({ _id: new mongoose_1.default.Types.ObjectId(wasteId) }, {
                    $set: {
                        wasteCompany: req.session.authenticationID,
                        wasteCompanyDate: new Date(Date.now()).toISOString(),
                    },
                });
                if (updatedCompany.acknowledged) {
                    logs = [
                        {
                            field: "Successful Updation",
                            message: blockchain_result,
                        },
                    ];
                    res.status(200).json({ logs });
                    return { logs };
                }
                else {
                    logs = [
                        {
                            field: "Mongo Error",
                            message: blockchain_result,
                        },
                    ];
                    res.status(400).json({ logs });
                    return { logs };
                }
            })
                .catch((err) => {
                console.log(err);
                logs = [
                    {
                        field: "Blockchain Error - Waste Updation",
                    },
                ];
                res.status(400).json({ logs });
                return;
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
                field: "Invalid Company",
                message: "Better check with administrator",
            },
        ];
        res.status(400).json({ logs });
        return;
    }
};
const wasteBlockchain = async (req, res) => {
    let logs;
    const key = req.body.key;
    console.log(req.body);
    var trackingContract = new (web3_1.web3.getWeb3().eth.Contract)(web3_1.TrackingABI.abi, process.env.TRACKING_ADDRESS, {});
    await trackingContract.methods
        .getWaste(key)
        .send({ from: process.env.OWNER_ADDRESS, gasPrice: "3000000" })
        .then(async function (blockchain_result) {
        console.log(blockchain_result);
        logs = [
            {
                field: "Waste Log",
                message: blockchain_result,
            },
        ];
        res.status(200).json({ logs });
        return;
    })
        .catch(async (err) => {
        console.log(err);
        logs = [
            {
                field: "Blockchain Error",
                message: err,
            },
        ];
        res.status(400).json({ logs });
        return;
    });
};
const getWasteQRDetails = async (req, res) => {
    const db = await connection_1.connection.getDb();
    let logs;
    const key = req.params.key;
    var trackingContract = new (web3_1.web3.getWeb3().eth.Contract)(web3_1.TrackingABI.abi, process.env.TRACKING_ADDRESS, {});
    await trackingContract.methods
        .getWaste(key)
        .send({ from: process.env.OWNER_ADDRESS, gasPrice: "3000000" })
        .then(async function (blockchain_result) {
        console.log(blockchain_result);
        let userCollection = db.collection("user");
        let _user = await userCollection.findOne({ _id: new mongoose_1.default.Types.ObjectId(blockchain_result.events.WasteData.returnValues.user) });
        let _agentName = "-";
        let _companyName = "-";
        if (blockchain_result.events.WasteData.returnValues.agent !== "-") {
            let agentCollection = db.collection("agent");
            let _agent = await agentCollection.findOne({ _id: new mongoose_1.default.Types.ObjectId(blockchain_result.events.WasteData.returnValues.agent) });
            _agentName = _agent.agentName;
        }
        if (blockchain_result.events.WasteData.returnValues.company !== "-") {
            let companyCollection = db.collection("company");
            let _company = await companyCollection.findOne({ _id: new mongoose_1.default.Types.ObjectId(blockchain_result.events.WasteData.returnValues.company) });
            _companyName = _company.companyName;
        }
        logs = {
            field: "Waste Log",
            wasteDescription: blockchain_result.events.WasteData.returnValues.description,
            wasteWeight: blockchain_result.events.WasteData.returnValues.weight,
            wasteUser: blockchain_result.events.WasteData.returnValues.user,
            wasteUserName: _user.userName,
            wasteAgent: blockchain_result.events.WasteData.returnValues.agent,
            wasteAgentName: _agentName,
            wasteCompany: blockchain_result.events.WasteData.returnValues.company,
            wasteCompanyName: _companyName,
            wasteSubmitted: blockchain_result.events.WasteData.returnValues.submitDate,
            wasteExist: blockchain_result.events.WasteData.returnValues.exist,
        };
        res.status(200).json(logs);
        return;
    })
        .catch(async (err) => {
        console.log(err);
        logs = [
            {
                field: "Blockchain Error",
                message: err,
            },
        ];
        res.status(400).json({ logs });
        return;
    });
};
const getWasteDetails = async (req, res) => {
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
    const key = req.body.key;
    var trackingContract = new (web3_1.web3.getWeb3().eth.Contract)(web3_1.TrackingABI.abi, process.env.TRACKING_ADDRESS, {});
    await trackingContract.methods
        .getWaste(key)
        .send({ from: process.env.OWNER_ADDRESS, gasPrice: "3000000" })
        .then(async function (blockchain_result) {
        console.log(blockchain_result);
        let userCollection = db.collection("user");
        let _user = await userCollection.findOne({ _id: new mongoose_1.default.Types.ObjectId(blockchain_result.events.WasteData.returnValues.user) });
        let _agentName = "-";
        let _companyName = "-";
        if (blockchain_result.events.WasteData.returnValues.agent !== "-") {
            let agentCollection = db.collection("agent");
            let _agent = await agentCollection.findOne({ _id: new mongoose_1.default.Types.ObjectId(blockchain_result.events.WasteData.returnValues.agent) });
            _agentName = _agent.agentName;
        }
        if (blockchain_result.events.WasteData.returnValues.company !== "-") {
            let companyCollection = db.collection("company");
            let _company = await companyCollection.findOne({ _id: new mongoose_1.default.Types.ObjectId(blockchain_result.events.WasteData.returnValues.company) });
            _companyName = _company.companyName;
        }
        logs = {
            field: "Waste Log",
            wasteDescription: blockchain_result.events.WasteData.returnValues.description,
            wasteWeight: blockchain_result.events.WasteData.returnValues.weight,
            wasteUser: blockchain_result.events.WasteData.returnValues.user,
            wasteUserName: _user.userName,
            wasteAgent: blockchain_result.events.WasteData.returnValues.agent,
            wasteAgentName: _agentName,
            wasteCompany: blockchain_result.events.WasteData.returnValues.company,
            wasteCompanyName: _companyName,
            wasteSubmitted: blockchain_result.events.WasteData.returnValues.submitDate,
            wasteExist: blockchain_result.events.WasteData.returnValues.exist,
        };
        res.status(200).json(logs);
        return;
    })
        .catch(async (err) => {
        console.log(err);
        logs = [
            {
                field: "Blockchain Error",
                message: err,
            },
        ];
        res.status(400).json({ logs });
        return;
    });
};
const getWasteQR = async (req, res) => {
    let logs;
    const wasteId = req.body.key;
    let generatedQR;
    try {
        await QRCodeGeneratorFunction(wasteId).then(async function (generatedQR) {
            let imageLink;
            try {
                console.log(generatedQR);
                setTimeout(async () => {
                    imageLink = await (0, ImgurUpload_1.uploadOnImgur)(generatedQR.fileName.toString());
                    logs = {
                        field: "Image Generated",
                        message: imageLink,
                    };
                    res.status(200).json(logs);
                    return;
                }, 1000);
                console.log(imageLink);
            }
            catch (err) {
                logs = {
                    field: "Imgur Error",
                    message: err,
                };
                res.status(400).json(logs);
                return;
            }
            logs = {
                field: "Image Generated",
                message: imageLink,
            };
            return;
        });
    }
    catch (err) {
        console.log(err);
        logs = {
            field: "QR Generation Error",
            message: err,
        };
        res.status(400).json(logs);
        return;
    }
};
const wasteComplete = async (req, res) => {
    let logs;
    const key = req.body.key;
    console.log(req.body);
    var trackingContract = new (web3_1.web3.getWeb3().eth.Contract)(web3_1.TrackingABI.abi, process.env.TRACKING_ADDRESS, {});
    await trackingContract.methods
        .concludeWaste(req.session.authenticationID, key)
        .send({ from: process.env.OWNER_ADDRESS, gasPrice: "3000000" })
        .then(function (blockchain_result) {
        console.log(blockchain_result);
        logs = {
            field: "Waste Concluded Log",
            message: blockchain_result,
        };
        res.status(200).json(logs);
        return;
    })
        .catch((err) => {
        console.log(err);
        logs = [
            {
                field: "Blockchain Error",
                message: err,
            },
        ];
        res.status(400).json({ logs });
        return;
    });
};
module.exports = {
    wasteUser,
    wasteAgent,
    wasteCompany,
    wasteBlockchain,
    wasteComplete,
    getWasteQRDetails,
    getWasteQR,
    getWasteDetails
};
//# sourceMappingURL=WasteController.js.map