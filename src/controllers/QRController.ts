import QRCode from "qrcode"
import { Request, Response } from 'express';
import { ResponseFormat } from "../resolvers/Format";
import argon2 from "argon2";
import { connection } from "../connection";
import { MongoServerError } from 'mongodb'
var base64ToImage = require('base64-to-image');

require('dotenv').config()

const generateURL = (wasteId: string) => {
    return `https://rrr-server.onrender.com/waste/${wasteId}`;
};

const QRCodeGenerator = async (req: Request, res: Response) => {
    //TODO: Add validation
    const wasteId = req.body.key;
    const url = generateURL(wasteId);
    const qrCode = await QRCode.toDataURL(url, {
        type: "image/png",
        margin: 1,
        width: 300,
    });
    console.log(qrCode)
    const path = './src/public/'

    const imgdata = qrCode
    let saveImage = base64ToImage(imgdata, path);

    console.log(saveImage)
    // res.setHeader("content-type", "image/png");
    // res.status(200).json({qrCode});
    return saveImage
}

const QRCodeGeneratorFunction = async (wasteId: string) => {
    //TODO: Add validation

    const url = generateURL(wasteId);
    const qrCode = await QRCode.toDataURL(url, {
        type: "image/png",
        margin: 1,
        width: 300,
    });
    console.log(qrCode)
    const path = './public/'

    const imgdata = qrCode
    let saveImage = base64ToImage(imgdata, path);

    console.log(saveImage)
    // res.setHeader("content-type", "image/png");
    
    // res.status(200).json({qrCode});
    return saveImage
}

module.exports = {
    QRCodeGenerator, QRCodeGeneratorFunction
}