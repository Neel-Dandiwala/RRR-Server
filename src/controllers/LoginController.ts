import { Request, Response } from 'express';
import Agent from '../models/Agent';
import { ResponseFormat } from "../resolvers/Format";
import { validation } from "../utils/validation";
import argon2 from "argon2";
import { connection } from "../connection";
import { CredentialsInput } from "../utils/CredentialsInput";
import { MongoServerError } from 'mongodb'
import { LoginInfo } from '../types/LoginInfo';
import { QueryInfo } from '../types/QueryInfo';
import mongoose from 'mongoose';

const loginEntity = async (req: Request, res: Response) => {

    const db = await connection.getDb();

    // const collection = db.collection( 'test' );
    // console.log(req.body)
    try {
        let result;
        let logs;
        let collection;
        // let emailAttribute;
        const loginEntity = req.body as Pick<LoginInfo, "loginEmail" | "loginPassword" | "loginRole">
        let collectionName = (loginEntity.loginRole).toLowerCase();
        collection = db.collection((loginEntity.loginRole).toLowerCase());
        if (collectionName === 'user') {
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
                    return { logs };

                }
                else {
                    res.status(400).json({ err });

                    throw new Error(err)
                }
            }
            const valid = await argon2.verify(result.userPassword, loginEntity.loginPassword);
            if (valid) {
                console.log(result);
                req.session.authenticationID = (result._id).toString();
                logs = [
                    {
                        field: "Successful Log In",
                        message: result.userName,
                    }
                ]

                res.status(200).json({ logs });
                return { logs };
            } else {
                logs = [
                    {
                        field: "Password",
                        message: "Incorrect password",
                    }
                ]

                res.status(400).json({ logs });
                return { logs };
            }
        } else if (collectionName === 'agent') {
            try {
                result = await collection.findOne({
                    agentEmail: loginEntity.loginEmail
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
                    return { logs };

                }
                else {
                    res.status(400).json({ err });

                    throw new Error(err)
                }
            }
            const valid = await argon2.verify(result.agentPassword, loginEntity.loginPassword);
            if (valid) {
                console.log(result);
                req.session.authenticationID = (result._id).toString();
                logs = [
                    {
                        field: "Successful Log In",
                        message: result.agentName,
                    }
                ]

                res.status(200).json({ logs });
                return { logs };
            } else {
                logs = [
                    {
                        field: "Password",
                        message: "Incorrect password",
                    }
                ]

                res.status(400).json({ logs });
                return { logs };
            }
        } else if (collectionName === 'company') {
            try {
                result = await collection.findOne({
                    companyEmail: loginEntity.loginEmail
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
                    return { logs };

                }
                else {
                    res.status(400).json({ err });

                    throw new Error(err)
                }
            }
            const valid = await argon2.verify(result.companyPassword, loginEntity.loginPassword);
            if (valid) {
                console.log(result);
                req.session.authenticationID = (result._id).toString();
                logs = [
                    {
                        field: "Successful Log In",
                        message: result.companyName,
                    }
                ]

                res.status(200).json({ logs });
                return { logs };
            } else {
                logs = [
                    {
                        field: "Password",
                        message: "Incorrect password",
                    }
                ]

                res.status(400).json({ logs });
                return { logs };
            }
        }


    } catch (e) {
        res.status(400).json({ e });
        throw e;
    }
}

const me = async (req: Request, res: Response) => {
    // Not logged in
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
    logs = [
        {
            field: "Logged in",
            message: req.session.authenticationID,
        }
    ]
    res.status(200).json({ logs });
    return req.session.authenticationID;
}

const logoutEntity = async (req: Request, res: Response) => {
    let logs;
    try {
        req.session.destroy((err) => {
            res.clearCookie('rrrid');
            // req.session = null;   
            if (err) {
                console.log(err);
                logs = [
                    {
                        field: "Error in Clearing Cookie",
                        message: "Please contact the administrator",
                    }
                ]
                res.status(400).json({ logs });
                return;
            }

            logs = [
                {
                    field: "Successful Logout",
                    message: "Logged out",
                }
            ]
            res.status(200).json({ logs });
            return;

        })
    } catch (e) {
        console.log(e);
        logs = [
            {
                field: "Error in Clearing Cookie",
                message: "Please contact the administrator",
            }
        ]
        res.status(400).json({ logs });
        throw e;
    }
}

module.exports = {
    loginEntity, me, logoutEntity
}