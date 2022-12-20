import { Request, Response } from 'express';
import User from '../models/User';
import { UserInfo } from '../types/UserInfo';
import { ResponseFormat } from "../resolvers/Format";
import { validation } from "../utils/validation";
import argon2 from "argon2";
import {connection} from "../connection";
import { CredentialsInput } from "../utils/CredentialsInput";
import {MongoServerError} from 'mongodb'

class UserResponse {
    logs?: ResponseFormat[];
    user?: UserInfo;
}

// const collection = connection.db('rrrdatabase').collection('test');

// @desc   Get User
// @route  GET /user/login
// @access Private
const getUsers = async(req:Request, res:Response) => {
        
    const db = await connection.getDb();

    const collection = db.collection( 'user' );

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
                    field: "Successful Insertion",
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



// @desc   Get User
// @route  GET /user/login
// @access Private
const setUser = async(req: Request, res: Response) => {
    console.log(req)
    const db = await connection.getDb();

    const collection = db.collection( 'user' );
    
    try {
        const userData = req.body  as Pick<UserInfo, "userName" | "userEmail" | "userPassword" | "userAge" | "userAddress" | "userPincode" | "userMobile" | "userCity" | "userState">
        console.log(userData);
        let credentials = new CredentialsInput();
        credentials.email = userData.userEmail;
        credentials.username = userData.userName;
        credentials.password = userData.userPassword;
        let logs = validation(credentials);
        if(logs){
            res.status(400).json({ logs });
            return {logs};
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
                    field: "Successful Retrieval",
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


// @desc   Get User
// @route  GET /user/login
// @access Private
const updateUser = async(res:Response) => {
    res.status(200).json({ message: 'User Update'});
}

// @desc   Get User
// @route  GET /user/login
// @access Private
const deleteUser = async(res:Response) => {
    res.status(200).json({ message: 'User Delete'});
}

module.exports = {
    getUsers, setUser, updateUser, deleteUser
}