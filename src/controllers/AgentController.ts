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
            agentAddress: agentData.agentAddress
            
        })

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
    getAgents, setAgent, updateAgent, deleteAgent, validationAgent
}