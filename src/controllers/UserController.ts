import { Request, Response } from 'express';
import User from '../models/User';
import { UserInfo } from '../types/UserInfo';
import { ResponseFormat } from "../resolvers/Format";
import { validation } from "../utils/validation";
import argon2 from "argon2";
import { connection } from "../connection";
import { CredentialsInput } from "../utils/CredentialsInput";
import { MongoServerError } from 'mongodb'
import { web3, ValidationABI, RewardABI } from "../web3"
import { calculateDistance, isNearby } from '../utils/searchNearby';
import { AgentDetails } from '../types/AgentDetails';
import { AgentInfo } from '../types/AgentInfo';
import { UserAgentFormInfo } from '../types/UserAgentFormInfo';
import UserAgentForm from '../models/UserAgentForm';
require('dotenv').config()

class UserResponse {
    logs?: ResponseFormat[];
    user?: UserInfo;
}

// const collection = connection.db('rrrdatabase').collection('test');

// @desc   Get User
// @route  GET /user/login
// @access Private
const getUsers = async (req: Request, res: Response) => {

    const db = await connection.getDb();

    const collection = db.collection('user');

    try {
        let result;
        let logs;
        try {
            result = await collection.find({}).toArray();
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
        // result = JSON.stringify(result, null, 2);
        if (result) {
            console.log(result);

            logs = [
                {
                    field: "Successful Extraction",
                    message: "Done",
                }
            ]


            res.status(200).json({ result });
            return { logs };
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
}



// @desc   Get User
// @route  GET /user/login
// @access Private
const setUser = async (req: Request, res: Response) => {
    console.log(req)
    const db = await connection.getDb();

    const collection = db.collection('user');

    try {
        const userData = req.body as Pick<UserInfo, "userName" | "userEmail" | "userPassword" | "userAge" | "userAddress" | "userPincode" | "userMobile" | "userCity" | "userState">
        console.log(userData);
        let credentials = new CredentialsInput();
        credentials.email = userData.userEmail;
        credentials.username = userData.userName;
        credentials.password = userData.userPassword;
        let logs = validation(credentials);
        if (logs) {
            res.status(400).json({ logs });
            return { logs };
        }

        const hashedPassword = await argon2.hash(userData.userPassword);
        const _user: UserInfo = new User({
            userName: userData.userName,
            userEmail: userData.userEmail,
            userPassword: hashedPassword,
            userAge: userData.userAge,
            userAddress: userData.userAddress,
            userPincode: userData.userPincode,
            userMobile: userData.userMobile,
            userCity: userData.userCity,
            userState: userData.userState,

        })

        let result;
        try {
            result = await collection.insertOne(_user);
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
            let validationContract = new (web3.getWeb3()).eth.Contract(ValidationABI.abi, process.env.VALIDATION_ADDRESS, {});
            validationContract.methods.addUser(result.insertedId.toString()).send({ from: process.env.OWNER_ADDRESS, gasPrice: '3000000' })
                .then(function (blockchain_result: any) {
                    console.log(blockchain_result)
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
            logs = [
                {
                    field: "Successful Insertion",
                    message: "Done",
                }
            ]

            res.status(200).json({ logs });
            return { logs };
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
}

// @desc  Validate user using Blockchain
// @route GET /validation/user
// @access Private
const validationUser = async (req: Request, res: Response) => {
    const key = req.body.key;
    console.log(req.body);
    let logs;
    var validationContract = new (web3.getWeb3()).eth.Contract(ValidationABI.abi, process.env.VALIDATION_ADDRESS, {});
    await validationContract.methods.validateUser(key).send({ from: process.env.OWNER_ADDRESS, gasPrice: '3000000' })
        .then(function (blockchain_result: any) {
            console.log(blockchain_result)
            res.status(200).json({ blockchain_result });
            return { blockchain_result };
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
}


// @desc  Validate user using Blockchain
// @route GET /validation/user
// @access Private
const getUserBalance = async (req: Request, res: Response) => {
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

    var rewardContract = new (web3.getWeb3()).eth.Contract(RewardABI.abi, process.env.REWARD_ADDRESS, {});
    await rewardContract.methods.balanceOf(req.session.authenticationID).send({ from: process.env.OWNER_ADDRESS, gas: '1000000', gasPrice: '3000000' })
        .then(function (blockchain_result: any) {
            console.log(blockchain_result)
            logs =
            {
                field: "Successful Balance",
                message: blockchain_result.events.Balance.returnValues.balance,
            }


            res.status(200).json({
                field: "Successful Balance",
                message: blockchain_result.events.Balance.returnValues.balance,
            });
            return;
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

// @desc   Get User
// @route  GET /user/login
// @access Private
const getNearbyAgents = async (req: Request, res: Response) => {
    const lat = req.body.lat;
    const lon = req.body.lon;
    const db = await connection.getDb();
    const collection = db.collection('agent');
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
            let result;

            class _AgentDetails extends AgentDetails {
                agentId: string
            }

            type agentData = {
                agent: _AgentDetails;
                distance: number;
            };
            // let _agentsCount = 0;
            // let _agents = new Array<agentData>(10);
            let _agents: agentData[] = [];
            result = await collection.find({}).toArray();
            // console.log(result)
            result.forEach(function (agent: any) {
                console.log(agent);
                let _distance = calculateDistance(lat, lon, agent.agentLatitude, agent.agentLongitude);
                console.log(_distance)
                if (_distance <= 5.0) {
                    console.log("Distance is good")
                    if (_agents.length < 10) {
                        let _agent: _AgentDetails = {
                            agentId: (agent._id).toString(),

                            agentName: agent.agentName,

                            agentEmail: agent.agentEmail,

                            agentAge: agent.agentAge,

                            agentMobile: agent.agentMobile,

                            agentAddress: agent.agentAddress,

                            agentCity: agent.agentCity,

                            agentState: agent.agentState,

                            agentPincode: agent.agentPincode,

                            agentLatitude: agent.agentLatitude,

                            agentLongitude: agent.agentLongitude,
                        }
                        _agents.push({
                            agent: _agent,
                            distance: _distance
                        });

                    } else {
                        // let maxDistanceFound = Math.max.apply(Math, _agents.map(function(obj) { return obj.distance; }))
                        for (let i = 0; i < 10; i++) {
                            if (_distance < _agents[i].distance) {
                                _agents[i] = {
                                    agent: agent,
                                    distance: _distance
                                }
                            } else {
                                continue
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
            ]
            res.status(400).json({ logs });
            return null;
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

// @desc   Get User
// @route  GET /user/login
// @access Private
const getUserBookings = async (req: Request, res: Response) => {
    const db = await connection.getDb();
    const collection = db.collection('user_agent_booking');
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
            type bookingData = {
                bookingUser: string,
                bookingAgent: string,
                bookingDate: string,
                bookingTimeSlot: string,
                bookingAddress: string,
                bookingPincode: string,
                bookingStatus: string,
            };
            let result;
            let _bookings: bookingData[] = [];


            try {
                result = await collection.find({ bookingUser: req.session.authenticationID }).toArray();
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
            result.forEach(function (booking: bookingData) {
                console.log('here')
                let _booking: any = {
                    bookingUser: booking.bookingUser,

                    bookingAgent: booking.bookingAgent,

                    bookingDate: booking.bookingDate,

                    bookingTimeSlot: booking.bookingTimeSlot,

                    bookingAddress: booking.bookingAddress,

                    bookingPincode: booking.bookingPincode,

                    bookingStatus: booking.bookingStatus,

                }
                console.log(_booking)
                _bookings.push(
                    _booking
                );

            });
            console.log(_bookings)
            res.status(200).json(_bookings);
            return _bookings;
        }
        catch (e) {
            logs = [
                {
                    field: "Some Error",
                    message: e,
                }
            ]
            res.status(400).json({ logs });
            return null;
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

// @desc   Get User
// @route  GET /user/login
// @access Private
const setUserAgentForm = async (req: Request, res: Response) => {
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

    const db = await connection.getDb();
    const collection = db.collection('user_agent_booking');
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
            const formData = req.body as Pick<UserAgentFormInfo, "bookingDate" | "bookingTimeSlot" | "bookingAddress" | "bookingPincode" | "bookingAgent">

            const _formData: UserAgentFormInfo = new UserAgentForm({
                bookingUser: req.session.authenticationID,

                bookingAgent: formData.bookingAgent,

                bookingDate: new Date(formData.bookingDate).toISOString(),

                bookingTimeSlot: formData.bookingTimeSlot,

                bookingAddress: formData.bookingAddress,

                bookingPincode: formData.bookingPincode,

                bookingStatus: 'Pending'

            })
            let result;
            try {
                result = await collection.insertOne(_formData);
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
                logs =
                {
                    field: "Successful Insertion of Form",
                    message: "Done",
                }


                res.status(200).json(logs);
                return { logs };
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

// @desc   Get User
// @route  GET /user/login
// @access Private
const updateUser = async (res: Response) => {
    res.status(200).json({ message: 'User Update' });
}



module.exports = {
    getUsers, setUser, updateUser, validationUser, getNearbyAgents, getUserBalance, setUserAgentForm, getUserBookings
}