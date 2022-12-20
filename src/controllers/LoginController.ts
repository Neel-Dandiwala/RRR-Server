import { Request, Response } from 'express';
import Agent from '../models/Agent';
import { ResponseFormat } from "../resolvers/Format";
import { validation } from "../utils/validation";
import argon2 from "argon2";
import { connection } from "../connection";
import { CredentialsInput } from "../utils/CredentialsInput";
import {MongoServerError} from 'mongodb'
import { LoginInfo } from '../types/LoginInfo';
import { QueryInfo } from '../types/QueryInfo';
import mongoose from 'mongoose';

const loginEntity = async(req: Request, res: Response) => {

    const db = await connection.getDb();

    const collection = db.collection( 'test' );
    // console.log(req.body)
    try {
        let result;
        let logs;
        const loginEntity = req.body as Pick<LoginInfo, "loginEmail" | "loginPassword" | "loginRole" >
        try {
            result = await collection.findOne({
                userEmail: loginEntity.loginEmail
            });
            console.log(result);
        } catch (err) {
            if (err instanceof MongoServerError && err.code === 11000) {
                console.error("# Duplicate Data Found:\n", err)
                logs = [{
                    field: "Entity Missing",
                    message: "That entity doesn't exist",
                }]
                res.status(400).json({ logs });
                return {logs};
                
            }
            else {
                res.status(400).json({ err });
                
                throw new Error(err)
            }
        }
        const valid = await argon2.verify(result.userPassword, loginEntity.loginPassword);
        if(valid){
            console.log(result);
            // req.session.authenticationID = loginEntity._id;
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

module.exports = {
    loginEntity
}