import { Request, Response } from 'express';
import Agent from '../models/Agent';
import { AgentInfo } from '../types/AgentInfo';
import { ResponseFormat } from "../resolvers/Format";
import { validation } from "../utils/validation";
import argon2 from "argon2";
import { connection } from "../connection";
import { CredentialsInput } from "../utils/CredentialsInput";
import {MongoServerError} from 'mongodb'
import { web3, ValidationABI } from "../web3"
import { getCoordinates } from '../utils/GeoLocation';
import axios from 'axios';
import { CompanyInfo } from '../types/CompanyInfo';
import { calculateDistance } from '../utils/searchNearby';
import mongoose from 'mongoose';


require('dotenv').config()

class AgentResponse {
    logs?: ResponseFormat[];
    agent?: AgentInfo;
}
// const collection = connection.db('rrrdatabase').collection('agent');

// @desc   Get agent
// @route  GET /agent/login
// @access Private
const getAgents = async(req:Request, res: Response) => {
        
    const db = await connection.getDb();

    const collection = db.collection( 'agent' );

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
                return {logs};
                
            }
            else {
                res.status(400).json({ err });
                
                throw new Error(err)
            }
        }
        // result = JSON.stringify(result, null, 2);
        if(result){
            console.log(result);
            logs = [
                {
                    field: "Successful Retrieval",
                    message: "Done",
                }
            ]
            

            res.status(200).json({ result  });
            return {logs};
        } else {
            logs = [
                {
                    field: "Unknown Error Occurred",
                    message: "Better check with administrator",
                }
            ]

            res.status(400).json({ logs });
            return {logs};
        }
    } catch (e) {
        res.status(400).json({ e });
        throw e;
    }
}



// @desc   Get agent
// @route  GET /agent/login
// @access Private
const setAgent = async(req: Request, res: Response) => {

    const db = await connection.getDb();

    const collection = db.collection( 'agent' );
    // console.log(req.body)
    try {
        const agentData = req.body as Pick<AgentInfo, "agentName" | "agentEmail" | "agentPassword" | "agentAge" | "agentPincode" | "agentMobile" | "agentCity" | "agentState" | "agentAddress">
        console.log(agentData);
        let credentials = new CredentialsInput();
        credentials.email = agentData.agentEmail;
        credentials.username = agentData.agentName;
        credentials.password = agentData.agentPassword;
        let logs = validation(credentials);
        if(logs){
            res.status(400).json({ logs });
            return { logs };
        }


        const hashedPassword = await argon2.hash(credentials.password);
        const _agent: AgentInfo = new Agent({
            agentName: agentData.agentName,
            agentEmail: agentData.agentEmail,
            agentPassword: hashedPassword,
            agentAge: agentData.agentAge,
            agentMobile: agentData.agentMobile,
            agentCity: agentData.agentCity,
            agentState: agentData.agentState,
            agentPincode: agentData.agentPincode,
            agentAddress: agentData.agentAddress,
            agentLatitude:'',
            agentLongitude: ''
        })

        // let geoLocationResponse: any = await getCoordinates(_agent.agentAddress + ' ' + _agent.agentPincode);
        let geoLocationResponse: any;
        var API_KEY = process.env.LOCATIONIQ_API_KEY;
        var BASE_URL = "https://us1.locationiq.com/v1/search?format=json&limit=1";
        let address = _agent.agentAddress + ' ' + _agent.agentPincode
        var url = BASE_URL + "&key=" + API_KEY + "&q=" + address;

        let config = {
            method: 'get',
            url: url,
            headers: { }
          };
        await axios(config).then( function (response: any) {
            // console.log('Here')
            console.log(response.data[0])
            geoLocationResponse = response.data[0]
        }).catch(function (error: any) {
            console.log(error);
            geoLocationResponse = null
        });

        if (geoLocationResponse === null) {
            logs = [
                {
                    field: "LocationIQ Error",
                    message: "Better check with administrator",
                }
            ]

            res.status(400).json({ logs });
            return
        } else{
            console.log(geoLocationResponse)
            console.log(typeof geoLocationResponse)
            _agent.agentLatitude = geoLocationResponse.lat * 1;
            _agent.agentLongitude = geoLocationResponse.lon * 1;
        }

        let result;
        try {
            result = await collection.insertOne(_agent);
        } catch (err) {
            if (err instanceof MongoServerError && err.code === 11000) {
                console.error("# Duplicate Data Found:\n", err)
                logs = [{ 
                    field: "Unexpected Mongo Error",
                    message: "Default Message"
                }]
                res.status(400).json({ logs });
                return {logs};
                
            }
            else {
                res.status(400).json({ err });
                
                throw new Error(err)
            }
        }
        console.log(result);
        if(result.acknowledged){
            console.log(result);
            let validationContract = new (web3.getWeb3()).eth.Contract(ValidationABI.abi, process.env.VALIDATION_ADDRESS, {});
            validationContract.methods.addAgent(result.insertedId.toString()).send({from: process.env.OWNER_ADDRESS, gasPrice: '3000000'})
            .then(function(blockchain_result: any){
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
                return {logs};
            });
            logs = [
                {
                    field: "Successful Insertion",
                    message: "Done",
                }
            ]

            res.status(200).json({ logs });
            return {logs};
        } else {
            logs = [
                {
                    field: "Unknown Error Occurred",
                    message: "Better check with administrator",
                }
            ]

            res.status(400).json({ logs });
            return {logs};
        }
        

    } catch (e) {
        res.status(400).json({ e });
        throw e;
    }
}

// @desc  Validate Agent using Blockchain
// @route GET /validation/agent
// @access Private
const validationAgent = async(req: Request, res: Response) => {
    const key = req.body.key;
    console.log(req.body);
    let logs;
    var validationContract = new (web3.getWeb3()).eth.Contract(ValidationABI.abi, process.env.VALIDATION_ADDRESS, {});
            await validationContract.methods.validateAgent(key).send({from: process.env.OWNER_ADDRESS, gasPrice: '3000000'})
            .then(function(blockchain_result: any){
                console.log(blockchain_result)
                res.status(200).json({ blockchain_result });
                return {blockchain_result};
            }).catch((err: any) => {
                console.log(err)
                logs = [
                    {
                        field: "Blockchain Error",
                        message: err,
                    }
                ]
    
                res.status(400).json({ logs });
                return {logs};
            });
}

// @desc   Get User
// @route  GET /user/login
// @access Private
const getNearbyCompanies = async(req:Request, res:Response) => {
    const db = await connection.getDb();
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
            const searchAgent = db.collection('agent');
            let _agent = await searchAgent.findOne({ _id:  new mongoose.Types.ObjectId(req.session.authenticationID) });
            
            const lat = _agent.agentLatitude;
            const lon = _agent.agentLongitude;
            
            const collection = db.collection('company');
            let result;
            class CompanyDetails {

                companyId: string;

                companyName: string;
            
                companyEmail: string;
            
                companyPaperPrice: number;
            
                companyPlasticPrice: number;
            
                companyElectronicPrice: number;
            
                companyMobile: string;
            
                companyAddress: string;
            
                companyCity: string;
            
                companyState: string;
            
                companyPincode: string;
            
                companyLatitude: number;
            
                companyLongitude: number;
            
            }
            type companyData = {
                company: CompanyDetails;
                distance: number;
            };

            class _CompanyInfo extends CompanyInfo {
                _id: string;
            }
            // let _agentsCount = 0;
            // let _agents = new Array<companyData>(10);
            let _companies: companyData[] = [];
            result = await collection.find({}).toArray();
            // console.log(result)
            result.forEach(function (company: _CompanyInfo) {
                console.log(company);
                let _distance = calculateDistance(lat,lon, company.companyLatitude, company.companyLongitude);
                console.log(_distance)
                if (_distance <= 5.0) {
                    console.log("Distance is good")
                    let _company:CompanyDetails = {

                        companyId: company._id,

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
                    }
                    if(_companies.length < 10){
                        _companies.push({
                            company: _company,
                            distance: _distance
                        });
                        
                    } else {
                        // let maxDistanceFound = Math.max.apply(Math, _agents.map(function(obj) { return obj.distance; }))
                        for(let i = 0; i < 10; i++){
                            if(_distance < _companies[i].distance){
                                _companies[i] = {
                                    company: _company,
                                    distance: _distance
                                }
                            } else {
                                continue
                            }
                        }
                    }
                }
                
            }); 
            res.status(200).json({ _companies });
            return _companies;
        }
        catch(e) {
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
                field: "Invalid Agent",
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
const getAgentBookings = async (req: Request, res: Response) => {
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
    await validationContract.methods.validateAgent(req.session.authenticationID).send({ from: process.env.OWNER_ADDRESS, gasPrice: '3000000' })
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
                bookingId: string,
                bookingUser: string,
                bookingAgent: string,
                bookingUserName?: string,
                bookingDate: string,
                bookingTimeSlot: string,
                bookingAddress: string,
                bookingPincode: string,
                bookingStatus: string,
            };
            let result;
            let _bookings: bookingData[] = [];


            try {
                result = await collection.find({ bookingAgent: req.session.authenticationID }).toArray();
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
            for (const booking of result) {
                // console.log('here')

                const userCollection = db.collection('user');
                let _user;
                try {
                    _user = await userCollection.findOne({ _id:  new mongoose.Types.ObjectId(booking.bookingUser) })
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

                let _booking: any = {

                    bookingId: booking._id,

                    bookingUser: booking.bookingUser,

                    bookingAgent: booking.bookingAgent,

                    bookingUserName: _user.userName,

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

            };
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
                field: "Invalid Agent",
                message: "Better check with administrator",
            }
        ]

        res.status(400).json({ logs });
        return;
    }
}

const agentRejectBooking = async(req: Request, res:Response) => {
    const bookingId = req.body.key
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
    let result;
    try {
        result = await collection.findOne({ _id: new mongoose.Types.ObjectId(bookingId) });
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
    if(result.bookingAgent !== req.session.authenticationID) {
        logs = [
            {
                field: "Invalid Agent",
                message: "Better check with administrator",
            }
        ]

        res.status(400).json({ logs });
        return;
    }

    try {
        await collection.updateOne(
            { _id:  new mongoose.Types.ObjectId(bookingId) },
            { $set: { bookingStatus: 'Rejected' }})
            logs = {
                field: "Succesful Updation",
                message: "Booking Rejected by Agent"
            }
            res.status(200).json( logs );
            return { logs };
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

}

const agentAcceptBooking = async(req: Request, res:Response) => {
    const bookingId = req.body.key
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
    let result;
    try {
        result = await collection.findOne({ _id: new mongoose.Types.ObjectId(bookingId) });
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
    if(result.bookingAgent !== req.session.authenticationID) {
        logs = [
            {
                field: "Invalid Agent",
                message: "Better check with administrator",
            }
        ]

        res.status(400).json({ logs });
        return;
    }

    try {
        await collection.updateOne(
            { _id:  new mongoose.Types.ObjectId(bookingId) },
            { $set: { bookingStatus: 'Accepted' }})
            logs = {
                field: "Succesful Updation",
                message: "Booking Accepted by Agent"
            }
            res.status(200).json( logs );
            return { logs };
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

}

// @desc   Get User
// @route  GET /user/login
// @access Private
const setAgentCompanyForm = async (req: Request, res: Response) => {
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

// @desc   Get agent
// @route  GET /agent/login
// @access Private
const updateAgent = async(res: Response) => {
    res.status(200).json({ message: 'agent Update'});
}

// @desc   Get agent
// @route  GET /agent/login
// @access Private
const deleteAgent = async(res: Response) => {
    res.status(200).json({ message: 'agent Delete'});
}

module.exports = {
    getAgents, setAgent, updateAgent, deleteAgent, validationAgent, getNearbyCompanies, getAgentBookings, agentRejectBooking, agentAcceptBooking
}