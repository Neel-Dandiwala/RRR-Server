import { Request, Response } from 'express';
import Agent from '../models/Agent';
import { ResponseFormat } from "../resolvers/Format";
import { validation } from "../utils/validation";
import argon2 from "argon2";
import { connection } from "../connection";
import { CredentialsInput } from "../utils/CredentialsInput";
import {MongoServerError} from 'mongodb'
import { AdminInfo } from '../types/AdminInfo';
import { QueryInfo } from '../types/QueryInfo';
import mongoose from 'mongoose';
// import { serverContext } from '../context';

class AdminResponse {
    logs?: ResponseFormat[];
}


// const collection = connection.db('rrrdatabase').collection('agent');

// @desc   Get agent
// @route  GET /agent/login
// @access Private
const getAdminQueries = async(req:Request, res: Response) => {
    try {
        if (!req.session ) {
            const logs =  {
                field: "Session ID Missing",
                message: "Please login first"
            }
            res.status(400).json({ logs });
        }
    } catch (e) {
        res.status(400).json({ e });
        throw e;
    } 

    const db = await connection.getDb();

    const collection = db.collection( 'queries' );

    try {
        let result;
        let logs;
        try {
            result = await collection.find({ querySolved: false }, { projection: { _id: 1, queryEmail: 1, queryText: 1 } }).toArray()
            
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
            // console.log(result);
            logs = [
                {
                    field: "Successful Retrieval",
                    message: req.sessionID,
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

const getAdminSession = async(req:Request, res: Response) => {
    try{
        if (!req.session.authenticationID) {
            const logs =  {
                field: "Session ID Missing",
                message: req.session.authenticationID
            }        
            res.status(400).json({ logs });
        } else {
            const logs =  {
                field: "Session ID There",
                message: req.session.authenticationID
            }        
            res.status(400).json({ logs });
        }
    } catch (e) {
        res.status(400).json({ e });
        throw e;
    }
    
}

const logoutAdmin = async(req:Request, res: Response) => {
    try{
        let logs;
        if (!req.session) {
            logs =  {
                field: "Session ID Missing",
                message: req.sessionID
            }        
            res.status(400).json({ logs });
        } else {
            req.session.destroy((err) => {
                if (err) {
                  console.log(err);
                    logs = [
                    {
                        field: "Unknown Error Occurred",
                        message: "Better check with administrator",
                    }
                ]
    
                res.status(400).json({ logs });;
                }
        
                
              });
            logs =  {
                field: "Log Out Successful",
                message: "Cleared"
            }        
            res.status(200).json({ logs });
        }
    } catch (e) {
        res.status(400).json({ e });
        throw e;
    }
    
}
// @desc   Get agent
// @route  GET /agent/login
// @access Private
const loginAdmin = async(req: Request, res: Response) => {

    const db = await connection.getDb();

    const collection = db.collection( 'admin' );
    // console.log(req.body)
    try {
        let result;
        let logs;
        const admin = req.body as Pick<AdminInfo, "_id" | "adminName" | "adminPassword" >
        try {
            result = await collection.findOne({
                _id: admin._id
            });
            console.log(result);
        } catch (err) {
            if (err instanceof MongoServerError && err.code === 11000) {
                console.error("# Duplicate Data Found:\n", err)
                logs = [{
                    field: "ID Error",
                    message: "That ID doesn't exist",
                }]
                res.status(400).json({ logs });
                return {logs};
                
            }
            else {
                res.status(400).json({ err });
                
                throw new Error(err)
            }
        }
        const valid = await argon2.verify(result.adminPassword, admin.adminPassword);
        if(valid){
            console.log(result);
            req.session.authenticationID = admin._id;
            logs = [
                {
                    field: "Successful Log In",
                    message: req.sessionID,
                }
            ]

            res.status(200).json({ logs });
            return {logs};
        } else {
            logs = [
                {
                    field: "Password",
                    message: "Incorrect password",
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
const setQuery = async(req:Request, res: Response) => {
    const db = await connection.getDb();

    const collection = db.collection( 'queries' );
    // console.log(req.body)
    try {
        const queryData = req.body as Pick<QueryInfo, "queryEmail" | "queryText">

        const _query: QueryInfo = {
            queryEmail: queryData.queryEmail,
            queryText: queryData.queryText,
            queryResponse: '',
            querySolved: false
            
        }

        let result;
        let logs;
        try {
            result = await collection.insertOne(_query);
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

// @desc   Get agent
// @route  GET /agent/login
// @access Private
const replyQuery = async(req:Request, res: Response) => {
    try {
        if (!req.session) {
            const logs =  {
                field: "Session ID Missing",
                message: "Please login first"
            }
            res.status(400).json({ logs });
        }
    } catch (e) {
        res.status(400).json({ e });
        throw e;
    } 
    const db = await connection.getDb();

    const collection = db.collection( 'queries' );
    console.log(req.body)
    try {
        const queryData = req.body as Pick<QueryInfo,"queryResponse">
        const queryId = req.params.id

        const _query: QueryInfo = {
            _id: new mongoose.Types.ObjectId(queryId),
            queryResponse: queryData.queryResponse,
            
        }

        console.log(_query._id)

        let result;
        let logs;
        try {
            result = await collection.updateOne({ _id: _query._id }, {$set: { queryResponse: _query.queryResponse, querySolved: true }});
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
            logs = [
                {
                    field: "Successful Finding",
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

// @desc   Get agent
// @route  GET /agent/login
// @access Private
const getQuery = async(req:Request, res: Response) => {
    
        
    const db = await connection.getDb();

    const collection = db.collection( 'queries' );

    try {
        let result;
        let logs;
        const queryId = req.params.id
        const _query: QueryInfo = {
            _id: new mongoose.Types.ObjectId(queryId),
        }


        try {
            result = await collection.find({ _id: _query._id }, { projection: { _id: 1, queryEmail: 1, queryText: 1, queryResponse: 1 } }).toArray()
            
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
            // console.log(result);
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

module.exports = {
    getAdminQueries, loginAdmin, setQuery, replyQuery, getQuery, getAdminSession, logoutAdmin
}