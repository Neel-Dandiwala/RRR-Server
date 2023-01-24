"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const qrcode_1 = __importDefault(require("qrcode"));
var base64ToImage = require('base64-to-image');
require('dotenv').config();
const generateURL = (wasteId) => {
    return `https://rrr-server.onrender.com/waste/${wasteId}`;
};
const QRCodeGenerator = async (req, res) => {
    const wasteId = req.body.key;
    const url = generateURL(wasteId);
    const qrCode = await qrcode_1.default.toDataURL(url, {
        type: "image/png",
        margin: 1,
        width: 300,
    });
    console.log(qrCode);
    const path = './src/public/';
    const imgdata = qrCode;
    let saveImage = base64ToImage(imgdata, path);
    console.log(saveImage);
    return saveImage;
};
const QRCodeGeneratorFunction = async (wasteId) => {
    const url = generateURL(wasteId);
    const qrCode = await qrcode_1.default.toDataURL(url, {
        type: "image/png",
        margin: 1,
        width: 300,
    });
    console.log(qrCode);
    const path = './public/';
    const imgdata = qrCode;
    let saveImage = base64ToImage(imgdata, path);
    console.log(saveImage);
    return saveImage;
};
module.exports = {
    QRCodeGenerator, QRCodeGeneratorFunction
};
//# sourceMappingURL=QRController.js.map