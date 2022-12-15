import { Request, Response } from 'express';
import Company from '../models/Company';
import { CompanyInfo } from '../types/CompanyInfo';
import { ResponseFormat } from "../resolvers/Format";
import { validation } from "../utils/validation";
import argon2 from "argon2";
import { connection } from "../connection";
import { CredentialsInput } from "../utils/CredentialsInput";
import {MongoServerError} from 'mongodb'

class CompanyResponse {
    logs?: ResponseFormat[];
    company?: CompanyInfo;
}

// const collection = connection.db('rrrdatabase').collection('company');

// @desc   Get company
// @route  GET /company/login
// @access Private
const getCompanies = async(req:Request, res: Response) => {
    const db = await connection.getDb();

    const collection = db.collection( 'company' );
        
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
        result = JSON.stringify(result, null, 2);
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



// @desc   Get company
// @route  GET /company/login
// @access Private
const setCompany = async(req: Request, res: Response) => {
    const db = await connection.getDb();

    const collection = db.collection( 'company' );
    // console.log(req.body)
    try {
        const companyData = req.body as Pick<CompanyInfo, "companyName" | "companyEmail" | "companyPassword" | "companyPaperPrice" | "companyPlasticPrice" | "companyElectronicPrice" | "companyAddress" | "companyCity" | "companyState" | "companyPincode">
        console.log(companyData);
        let credentials = new CredentialsInput();
        credentials.email = companyData.companyEmail;
        credentials.username = companyData.companyName;
        credentials.password = companyData.companyPassword;
        let logs = validation(credentials);
        if(logs){
            res.status(400).json({ logs });
            return { logs };
        }

        const hashedPassword = await argon2.hash(credentials.password);
        const _company: CompanyInfo = new Company({
            companyName: companyData.companyName,
            companyEmail: companyData.companyEmail,
            companyPassword: hashedPassword,
            companyPaperPrice: companyData.companyPaperPrice,
            companyPlasticPrice: companyData.companyPlasticPrice,
            companyElectronicPrice: companyData.companyElectronicPrice,
            companyAddress: companyData.companyAddress,
            companyCity: companyData.companyCity,
            companyState: companyData.companyState,
            companyPincode: companyData.companyPincode,
            
        })

        let result;

        try {
            result = await collection.insertOne(_company);
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

// @desc   Get company
// @route  GET /company/login
// @access Private
const updateCompany = async( res: Response) => {
    res.status(200).json({ message: 'company Update'});
}

// @desc   Get company
// @route  GET /company/login
// @access Private
const deleteCompany = async(res: Response) => {
    res.status(200).json({ message: 'company Delete'});
}

module.exports = {
    getCompanies, setCompany, updateCompany, deleteCompany
}