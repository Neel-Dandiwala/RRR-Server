import { Request, Response } from 'express';
import { ResponseFormat } from "../resolvers/Format";
import { connection } from "../connection";
import { MongoServerError } from 'mongodb'
import { web3, ValidationABI, TrackingABI, RewardABI } from "../web3"
import { isNullableType } from 'graphql';
import mongoose from 'mongoose';
import Token from '../models/Token';
import { TokenInfo } from '../types/TokenInfo';
import { TokenAdminInfo } from 'src/types/TokenAdminInfo';

const addDays = (days: number) => {
    var datetemp = new Date(Date.now());
    var date = new Date(datetemp.valueOf());
    date.setDate(date.getDate() + days);
    return date.toISOString();
}

require('dotenv').config()

const rewardTransferFrom = async (req: Request, res: Response) => {
    const bookingId = req.body.key;
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
        return;
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
                    field: "Blockchain Error - Agent Validation",
                    message: err,
                }
            ]

            res.status(400).json({ logs });
            return;
        });

    console.log(validAgent)
    if (validAgent) {
        // console.log("HERERERERE")
        try {
            const bookingCollection = db.collection('agent_company_booking');
            let bookingData;
            try {
                bookingData = await bookingCollection.findOne({ _id: new mongoose.Types.ObjectId(bookingId) });
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

            if (bookingData === null) {
                logs =
                {
                    field: "Invalid Booking Id",
                    message: "Better check with administrator",
                }
                res.status(400).json({ logs });
                return;
            }

            for (const wasteId of bookingData.wasteIds) {
                let wasteData: any;
                try {
                    wasteData = await collection.findOne({ _id: new mongoose.Types.ObjectId(wasteId) });
                    if (wasteData.wasteAgent !== req.session.authenticationID) {
                        logs = [
                            {
                                field: "Invalid Agent",
                                message: "Waste specifies another Agent",
                            }
                        ]

                        res.status(400).json({ logs });
                        return;
                    }
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
                console.log(wasteData);
                try {
                    var validationContract = new (web3.getWeb3()).eth.Contract(ValidationABI.abi, process.env.VALIDATION_ADDRESS, {});
                    await validationContract.methods.validateUser(wasteData.wasteUser).send({ from: process.env.OWNER_ADDRESS, gasPrice: '3000000' })
                        .then(function (blockchain_result: any) {
                            console.log(blockchain_result)

                        }).catch((err: any) => {
                            console.log(err)
                            logs = [
                                {
                                    field: "Blockchain Error - User Validation",
                                    message: err,
                                }
                            ]
                            res.status(400).json({ logs });
                            return;
                        });
                } catch (err) {
                    logs = [
                        {
                            field: "Blockchain Error",
                            message: err,
                        }
                    ]
                    res.status(400).json({ logs });
                    return;
                }
                let amount = parseInt(wasteData.wasteWeight);
                let updatedWaste;
                var rewardContract = new (web3.getWeb3()).eth.Contract(RewardABI.abi, process.env.REWARD_ADDRESS, {});
                await rewardContract.methods.transferFrom(wasteData.wasteAgent, wasteData.wasteUser, amount).send({ from: process.env.OWNER_ADDRESS, gas: '1000000', gasPrice: '3000000' })
                    .then(async function (blockchain_result: any) {
                        console.log(blockchain_result)
                        // logs = [
                        //     {
                        //         field: "Successful TransferFrom",
                        //         message: blockchain_result,
                        //     }
                        // ]

                        // res.status(200).json({ logs });
                        // return;

                        updatedWaste = await collection.updateOne(
                            { _id: new mongoose.Types.ObjectId(wasteId) },
                            {
                                $set: {
                                    wasteTwoWay: new Date(Date.now()).toISOString(),
                                },
                            }
                        );
                        if (!updatedWaste.acknowledged) {
                            logs =
                                {
                                    field: "Failed Updation",
                                    message: "Error in modifying each waste",
                                }
            
                            res.status(400).json({ logs });
                            return { logs };
                        }

                    }).catch((err: any) => {
                        console.log(err)
                        logs = [
                            {
                                field: "Blockchain Error - TransferFrom",
                                message: err,
                            }
                        ]

                        res.status(400).json({ logs });
                        return;
                    });
            }
            logs = 
                {
                    field: "Successful TransferFrom",
                    message: "Transaction Received",
                }
            

            res.status(200).json(logs);
            return;
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

const rewardMint = async (req: Request, res: Response) => {
    const bookingId = req.body.key;
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
                    field: "Blockchain Error - Company Validation",
                    message: err,
                }
            ]

            res.status(400).json({ logs });
            return;
        });

    if (validCompany) {
        try {
            const bookingCollection = db.collection('agent_company_booking');
            let bookingData;
            try {
                bookingData = await bookingCollection.findOne({ _id: new mongoose.Types.ObjectId(bookingId) });
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

            if (bookingData === null) {
                logs =
                {
                    field: "Invalid Booking Id",
                    message: "Better check with administrator",
                }
                res.status(400).json({ logs });
                return;
            }
            for (const wasteId of bookingData.wasteIds) {
                let wasteData: any;
                try {
                    wasteData = await collection.findOne({ _id: new mongoose.Types.ObjectId(wasteId) });
                    if (wasteData.wasteCompany !== req.session.authenticationID) {
                        logs = [
                            {
                                field: "Invalid Company",
                                message: "Better check with log in",
                            }
                        ]

                        res.status(400).json({ logs });
                        return;
                    }
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
                try{
                    var trackingContract = new (web3.getWeb3().eth.Contract)(
                        TrackingABI.abi,
                        process.env.TRACKING_ADDRESS,
                        {}
                    );
                    await trackingContract.methods
                        .concludeWaste(req.session.authenticationID, wasteId)
                        .send({ from: process.env.OWNER_ADDRESS, gasPrice: "3000000" })
                        .then(function (blockchain_result: any) {
                            console.log(blockchain_result);
                            // logs = {
                            //     field: "Waste Concluded Log",
                            //     message: blockchain_result,
                            // };
                            // res.status(200).json(logs);
                            // return;
                        })
                        .catch((err: any) => {
                            console.log(err);
                
                            logs = [
                                {
                                    field: "Blockchain Error - Conclude waste",
                                    message: err,
                                },
                            ];
                            res.status(400).json({ logs });
                            return;
                        });
                } catch (err) {
                    logs = [
                        {
                            field: "Blockchain Error",
                            message: err,
                        }
                    ]
                    res.status(400).json({ logs });
                    return;
                }
                console.log(wasteData);
                try {
                    var validationContract = new (web3.getWeb3()).eth.Contract(ValidationABI.abi, process.env.VALIDATION_ADDRESS, {});
                    await validationContract.methods.validateAgent(wasteData.wasteAgent).send({ from: process.env.OWNER_ADDRESS, gasPrice: '3000000' })
                        .then(function (blockchain_result: any) {
                            console.log(blockchain_result)
                        }).catch((err: any) => {
                            console.log(err)
                            logs = [
                                {
                                    field: "Blockchain Error - Agent Validation",
                                    message: err,
                                }
                            ]

                            res.status(400).json({ logs });
                            return;
                        });
                } catch (err) {
                    logs = [
                        {
                            field: "Blockchain Error",
                            message: err,
                        }
                    ]
                    res.status(400).json({ logs });
                    return;
                }
                let amount = parseInt(wasteData.wasteWeight);
                let updatedWaste;
                var rewardContract = new (web3.getWeb3()).eth.Contract(RewardABI.abi, process.env.REWARD_ADDRESS, {});
                await rewardContract.methods._mint(wasteData.wasteAgent, amount).send({ from: process.env.OWNER_ADDRESS, gasPrice: '3000000' })
                    .then(async function (blockchain_result: any) {
                        console.log(blockchain_result)
                        // logs = [
                        //     {
                        //         field: "Successful _Mint",
                        //         message: blockchain_result,
                        //     }
                        // ]

                        // res.status(200).json({ logs });
                        // return;
                        updatedWaste = await collection.updateOne(
                            { _id: new mongoose.Types.ObjectId(wasteId) },
                            {
                                $set: {
                                    wasteOneWay: new Date(Date.now()).toISOString(),
                                },
                            }
                        );
                        if (!updatedWaste.acknowledged) {
                            logs =
                                {
                                    field: "Failed Updation",
                                    message: "Error in modifying each waste",
                                }
            
                            res.status(400).json({ logs });
                            return { logs };
                        }
                    }).catch((err: any) => {
                        console.log(err)
                        logs = [
                            {
                                field: "Blockchain Error - _Mint",
                                message: err,
                            }
                        ]

                        res.status(400).json({ logs });
                        return;
                    });
            }
            logs = 
                {
                    field: "Successful Mint",
                    message: "Transaction Done",
                }
            

            res.status(200).json(logs);
            return;

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

const rewardBurn = async (req: Request, res: Response) => {
    // Burn happening in MintToken
}

const rewardMintToken = async (req: Request, res: Response) => {
    const db = await connection.getDb();
    const collection = db.collection('token');
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
            const tokenData = req.body as Pick<TokenInfo, "tokenName" | "tokenSymbol" | "tokenAmount" | "tokenExpires">
            console.log(tokenData);


            const _token: TokenInfo = new Token({
                tokenId: '',
                tokenUserId: req.session.authenticationID,
                tokenName: tokenData.tokenName,
                tokenSymbol: tokenData.tokenSymbol,
                tokenExpires: 0,
                tokenExpiresDate: addDays(tokenData.tokenExpires / 86400),
                tokenUsed: false,
                tokenAmount: tokenData.tokenAmount
            })

            let result: any;
            try {
                result = await collection.insertOne(_token);
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
                var rewardContract = new (web3.getWeb3()).eth.Contract(RewardABI.abi, process.env.REWARD_ADDRESS, {});
                await rewardContract.methods.mintToken(req.session.authenticationID, tokenData.tokenName, tokenData.tokenSymbol, tokenData.tokenAmount, result.insertedId.toString(), "100000000").send({ from: process.env.OWNER_ADDRESS, gas: '1000000', gasPrice: '3000000' })
                    .then(async function (blockchain_result: any) {
                        console.log(blockchain_result)
                        // blockchain_result.events.Transfer.returnValues.
                        let _tokenExpires = parseInt((blockchain_result.events.TokenEvent.returnValues.expires).toString());
                        let _tokenId = (blockchain_result.events.TokenEvent.returnValues.id).toString();

                        let updatedToken = await collection.updateOne(
                            { _id: result.insertedId },
                            { $set: { tokenId: _tokenId, tokenExpires: _tokenExpires } }
                        )
                        if (updatedToken.acknowledged) {
                            logs = {
                                tokenId: _tokenId,
                                tokenUserId: req.session.authenticationID,
                                tokenName: tokenData.tokenName,
                                tokenSymbol: tokenData.tokenSymbol,
                                tokenExpires: _tokenExpires,
                                tokenExpiresDate: _token.tokenExpiresDate,
                                tokenUsed: false,
                                tokenAmount: tokenData.tokenAmount
                            }

                            res.status(200).json( logs );
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

                        res.status(200).json({ logs });
                        return { logs };
                    }).catch(async (err: any) => {
                        console.log(err)
                        let deleted = await collection.deleteOne({ _id: result.insertedId });
                        if (deleted.acknowledged) {
                            logs = [
                                {
                                    field: "Blockchain Error - Token Insertion",
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

const rewardBurnToken = async (req: Request, res: Response) => {
    const db = await connection.getDb();
    const collection = db.collection('token');
    const key = req.body.key;
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
            let tokenData;
            try {
                tokenData = await collection.findOne({ _id: new mongoose.Types.ObjectId(key) });
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
            console.log(tokenData);
            let tokenId = parseInt(tokenData.tokenId);
            var rewardContract = new (web3.getWeb3()).eth.Contract(RewardABI.abi, process.env.REWARD_ADDRESS, {});
            await rewardContract.methods.burnToken(req.session.authenticationID, tokenId).send({ from: process.env.OWNER_ADDRESS, gas: '1000000', gasPrice: '3000000' })
                .then(async function (blockchain_result: any) {
                    console.log(blockchain_result)
                    let updatedToken = await collection.updateOne(
                        { _id: new mongoose.Types.ObjectId(key) },
                        { $set: { tokenUsed: true } }
                    )
                    if (updatedToken.acknowledged) {
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
                    res.status(200).json({ logs });
                    return { logs };
                }).catch((err: any) => {
                    console.log(err)
                    logs = [
                        {
                            field: "Blockchain Error",
                            message: err,
                        }
                    ]

                    res.status(400).json({ logs });
                    return { logs };
                });

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


const getMarketplaceTokens = async (req: Request, res: Response) => {
    const db = await connection.getDb();
    const collection = db.collection('tokens');
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
            let tokenData;
            try {
                tokenData = await collection.find({}).toArray();;
                console.log(tokenData)
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
            let _tokens: TokenAdminInfo[] = [];
            console.log(tokenData);
            for (const token of tokenData) {
                let _token: any = {
                    item_brand: token.tokenName,
                    item_date: token.tokenValidity / 86400,
                    item_description: token.tokenDescription,
                    item_image: token.tokenImage,
                    item_coins: token.tokenPrice
                }

                _tokens.push(
                    _token
                );

            };
            console.log(_tokens)
            res.status(200).json(_tokens);
            return _tokens;

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

const getbs = async (req: Request, res: Response) => {
    // let bs;
    var rewardContract = new (web3.getWeb3()).eth.Contract(RewardABI.abi, process.env.REWARD_ADDRESS, {});
    await rewardContract.methods.blockTimestamp().send({ from: process.env.OWNER_ADDRESS, gasPrice: '3000000' }).then(async function (blockchain_result: any) {
        console.log(blockchain_result)})
}

module.exports = {
    rewardTransferFrom, rewardMint, rewardBurn, rewardMintToken, rewardBurnToken, getMarketplaceTokens, getbs
}
