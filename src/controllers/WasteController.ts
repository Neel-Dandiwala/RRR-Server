import { Request, Response } from 'express';
import Waste from '../models/Waste';
import { ResponseFormat } from "../resolvers/Format";
import { connection } from "../connection";
import { MongoServerError } from 'mongodb'
import { web3, ValidationABI, TrackingABI } from "../web3"
import { isNullableType } from 'graphql';
import { WasteInfo } from '../types/WasteInfo';
import mongoose from 'mongoose';
require('dotenv').config()

const wasteUser = async (req: Request, res: Response) => {
    const db = await connection.getDb();
    let collection = db.collection('waste');
    let logs;
    if (!req.session.authenticationID) {
        logs = [
            {
                field: "Not logged in",
                message: "Please log in",
            }
        ]
        res.status(400).json({ logs });
        return null;
    }

    let validUser: boolean = false;

    var validationContract = new (web3.getWeb3()).eth.Contract(ValidationABI.abi, process.env.VALIDATION_ADDRESS, {});
    await validationContract.methods.validateUser(req.session.authenticationID).send({ from: process.env.OWNER_ADDRESS, gasPrice: '3000000' })
        .then(function (blockchain_result: any) {
            console.log(blockchain_result)
            validUser = true;
        }).catch((err: any) => {
            console.log(err)
            logs = [
                {
                    field: "Blockchain Error - Validation",
                    message: err,
                }
            ]

            res.status(400).json({ logs });
            return;
        });

    if (validUser) {
        try {
            // collection = db.collection('user');
            // let _user = await collection.findOne({ _id:  new mongoose.Types.ObjectId(req.session.authenticationID) });
            // collection = db.collection('waste');
            const wasteData = req.body as Pick<WasteInfo, "wasteDescription" | "wasteWeight">
            console.log(wasteData);
            const _waste: WasteInfo = new Waste({
                wasteDescription: wasteData.wasteDescription,
                wasteWeight: wasteData.wasteWeight,
                wasteUser: req.session.authenticationID,
                wasteUserDate: new Date(Date.now()).toISOString(),
                wasteAgent: '',
                wasteAgentDate: null,
                wasteCompany: '',
                wasteCompanyDate: null,

            })

            let result: any;
            try {
                result = await collection.insertOne(_waste);
            } catch (err) {
                if (err instanceof MongoServerError && err.code === 11000) {
                    console.error("# Duplicate Data Found:\n", err)
                    logs = [{
                        field: "Unexpected Mongo Error",
                        message: "Default Message"
                    }]
                    res.status(400).json({ logs });
                    return { logs };

                }
                else {
                    res.status(400).json({ err });

                    throw new Error(err)
                }
            }
            console.log(result);
            if (result.acknowledged) {
                console.log(result);
                var trackingContract = new (web3.getWeb3()).eth.Contract(TrackingABI.abi, process.env.TRACKING_ADDRESS, {});

                let id_ = (result.insertedId).toString();
                console.log(id_ + typeof (id_))
                let description_ = wasteData.wasteDescription;
                console.log(description_ + typeof (description_))
                let weight_ = wasteData.wasteWeight.toString();
                console.log(weight_ + typeof (weight_))
                let user_ = req.session.authenticationID;
                console.log(user_ + typeof (user_))

                await trackingContract.methods.creationWaste(id_, description_, weight_, user_).send({ from: process.env.OWNER_ADDRESS, gas: '1000000', gasPrice: '3000000' }).then(function (blockchain_result: any) {
                    console.log(blockchain_result)
                    logs = [
                        {
                            field: "Successful Insertion",
                            message: blockchain_result,
                        }
                    ]

                    res.status(200).json({ logs });
                    return { logs };
                }).catch(async (err: any) => {
                    console.log(err)
                    let deleted = await collection.deleteOne({ _id: result.insertedId });
                    if (deleted.acknowledged) {
                        logs = [
                            {
                                field: "Blockchain Error - Waste Insertion",
                                message: err,
                            }
                        ]
                        res.status(400).json({ logs });
                        return;
                    } else {
                        logs = [
                            {
                                field: "Blockchain Error and MongoDB Error",
                                message: err,
                            }
                        ]
                        res.status(400).json({ logs });
                        return;
                    }
                });
            } else {
                logs = [
                    {
                        field: "Unknown Error Occurred",
                        message: "Better check with administrator",
                    }
                ]

                res.status(400).json({ logs });
                return { logs };
            }


        } catch (e) {
            res.status(400).json({ e });
            throw e;
        }
    } else {
        logs = [
            {
                field: "Invalid User",
                message: "Better check with administrator",
            }
        ]

        res.status(400).json({ logs });
        return;
    }
}

const wasteAgent = async (req: Request, res: Response) => {
    const db = await connection.getDb();
    const collection = db.collection('waste');
    let logs;
    if (!req.session.authenticationID) {
        logs = [
            {
                field: "Not logged in",
                message: "Please log in",
            }
        ]
        res.status(400).json({ logs });
        return null;
    }

    let validAgent: boolean = false;

    var validationContract = new (web3.getWeb3()).eth.Contract(ValidationABI.abi, process.env.VALIDATION_ADDRESS, {});
    await validationContract.methods.validateAgent(req.session.authenticationID).send({ from: process.env.OWNER_ADDRESS, gasPrice: '3000000' })
        .then(function (blockchain_result: any) {
            console.log(blockchain_result)
            validAgent = true;
        }).catch((err: any) => {
            console.log(err)
            logs = [
                {
                    field: "Blockchain Error - Validation",
                    message: err,
                }
            ]

            res.status(400).json({ logs });
            return;
        });

    if (validAgent) {
        try {
            const wasteId = req.body.id;
            var trackingContract = new (web3.getWeb3()).eth.Contract(TrackingABI.abi, process.env.TRACKING_ADDRESS, {});
            let agent_ = req.session.authenticationID;
            console.log(agent_ + typeof (agent_))

            await trackingContract.methods.agentOwnWaste(agent_, wasteId).send({ from: process.env.OWNER_ADDRESS, gas: '1000000', gasPrice: '3000000' }).then(async function (blockchain_result: any) {
                console.log(blockchain_result)
                let updatedAgent = await collection.updateOne(
                    { _id:  new mongoose.Types.ObjectId(wasteId) },
                    { $set: { wasteAgent: req.session.authenticationID, wasteAgentDate: new Date(Date.now()).toISOString() }}
                )
                if(updatedAgent.acknowledged){
                    logs = [
                        {
                            field: "Successful Updation",
                            message: blockchain_result,
                        }
                    ]
    
                    res.status(200).json({ logs });
                    return { logs };
                } else {
                    logs = [
                        {
                            field: "Mongo Error",
                            message: blockchain_result,
                        }
                    ]
    
                    res.status(400).json({ logs });
                    return { logs };
                }
            }).catch( (err: any) => {
                console.log(err)
                    logs = [
                        {
                            field: "Blockchain Error - Waste Updation"
                        }
                    ]
                    res.status(400).json({ logs });
                    return;
                
            });
        } catch (e) {
            res.status(400).json({ e });
            throw e;
        }
    } else {
        logs = [
            {
                field: "Invalid Agent",
                message: "Better check with administrator",
            }
        ]

        res.status(400).json({ logs });
        return;
    }

}

const wasteCompany = async (req: Request, res: Response) => {
    const db = await connection.getDb();
    const collection = db.collection('waste');
    let logs;
    if (!req.session.authenticationID) {
        logs = [
            {
                field: "Not logged in",
                message: "Please log in",
            }
        ]
        res.status(400).json({ logs });
        return null;
    }

    let validCompany: boolean = false;

    var validationContract = new (web3.getWeb3()).eth.Contract(ValidationABI.abi, process.env.VALIDATION_ADDRESS, {});
    await validationContract.methods.validateCompany(req.session.authenticationID).send({ from: process.env.OWNER_ADDRESS, gasPrice: '3000000' })
        .then(function (blockchain_result: any) {
            console.log(blockchain_result)
            validCompany = true;
        }).catch((err: any) => {
            console.log(err)
            logs = [
                {
                    field: "Blockchain Error - Validation",
                    message: err,
                }
            ]

            res.status(400).json({ logs });
            return;
        });

    if (validCompany) {
        try {
            const wasteId = req.body.id;
            var trackingContract = new (web3.getWeb3()).eth.Contract(TrackingABI.abi, process.env.TRACKING_ADDRESS, {});
            let company_ = req.session.authenticationID;
            console.log(company_ + typeof (company_))

            await trackingContract.methods.companyOwnWaste(company_, wasteId).send({ from: process.env.OWNER_ADDRESS, gas: '1000000', gasPrice: '3000000' }).then(async function (blockchain_result: any) {
                console.log(blockchain_result)
                let updatedCompany = await collection.updateOne(
                    { _id:  new mongoose.Types.ObjectId(wasteId) },
                    { $set: { wasteCompany: req.session.authenticationID, wasteCompanyDate: new Date(Date.now()).toISOString() }}
                )
                if(updatedCompany.acknowledged){
                    logs = [
                        {
                            field: "Successful Updation",
                            message: blockchain_result,
                        }
                    ]
    
                    res.status(200).json({ logs });
                    return { logs };
                } else {
                    logs = [
                        {
                            field: "Mongo Error",
                            message: blockchain_result,
                        }
                    ]
    
                    res.status(400).json({ logs });
                    return { logs };
                }
                
            }).catch( (err: any) => {
                console.log(err)
                    logs = [
                        {
                            field: "Blockchain Error - Waste Updation"
                        }
                    ]
                    res.status(400).json({ logs });
                    return;
                
            });
        } catch (e) {
            res.status(400).json({ e });
            throw e;
        }
    } else {
        logs = [
            {
                field: "Invalid Company",
                message: "Better check with administrator",
            }
        ]

        res.status(400).json({ logs });
        return;
    }

}

const wasteBlockchain = async (req: Request, res: Response) => {
    let logs;
    const key = req.body.key;
    console.log(req.body);
    var trackingContract = new (web3.getWeb3()).eth.Contract(TrackingABI.abi, process.env.TRACKING_ADDRESS, {})
    await trackingContract.methods.getWaste(key).send({ from: process.env.OWNER_ADDRESS, gasPrice: '3000000' })
        .then(async function (blockchain_result: any) {
            console.log(blockchain_result)
            logs = [
                {
                    field: "Waste Log",
                    message: blockchain_result,
                }
            ]
            res.status(200).json({ logs });
            return;
        }).catch(async (err: any) => {
            console.log(err)

            logs = [
                {
                    field: "Blockchain Error",
                    message: err,
                }
            ]
            res.status(400).json({ logs });
            return;

        });
}

const wasteComplete = async (req: Request, res: Response) => {
    let logs;
    const key = req.body.key;
    console.log(req.body);
    var trackingContract = new (web3.getWeb3()).eth.Contract(TrackingABI.abi, process.env.TRACKING_ADDRESS, {})
    await trackingContract.methods.concludeWaste(req.session.authenticationID, key).send({ from: process.env.OWNER_ADDRESS, gasPrice: '3000000' })
        .then(function (blockchain_result: any) {
            console.log(blockchain_result)
            logs = [
                {
                    field: "Waste Concluded Log",
                    message: blockchain_result,
                }
            ]
            res.status(200).json({ logs });
            return;
        }).catch( (err: any) => {
            console.log(err)

            logs = [
                {
                    field: "Blockchain Error",
                    message: err,
                }
            ]
            res.status(400).json({ logs });
            return;

        });
}

module.exports = {
    wasteUser, wasteAgent, wasteCompany, wasteBlockchain, wasteComplete
}