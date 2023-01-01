import { Request, Response } from 'express';
import Waste from '../models/Waste';
import { ResponseFormat } from "../resolvers/Format";
import { connection } from "../connection";
import { MongoServerError } from 'mongodb'
import { web3, ValidationABI, TrackingABI } from "../web3"
import { isNullableType } from 'graphql';
import { WasteInfo } from '../types/WasteInfo';
require('dotenv').config()

const wasteUser = async (req: Request, res: Response) => {
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

            let result;
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
                
                    let id_ =  (result.insertedId).toString();
                    console.log(id_ + typeof(id_))
                    let description_ =  wasteData.wasteDescription;
                    console.log(description_ + typeof(description_))
                    let weight_ =  wasteData.wasteWeight.toString();
                    console.log(weight_ + typeof(weight_))
                    let user_ =  req.session.authenticationID;
                    console.log(user_ + typeof(user_))
                
                await trackingContract.methods.creationWaste(id_, description_, weight_, user_).send({ from: process.env.OWNER_ADDRESS, gas:'1000000' ,gasPrice: '3000000' }).then(function (blockchain_result: any) {
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
                        if(deleted.acknowledged){
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

}

const wasteCompany = async (req: Request, res: Response) => {

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

module.exports = {
    wasteUser, wasteAgent, wasteCompany, wasteBlockchain
}