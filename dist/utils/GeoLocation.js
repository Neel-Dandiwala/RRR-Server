"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCoordinates = void 0;
const axios_1 = __importDefault(require("axios"));
require('dotenv').config();
const getCoordinates = async (address) => {
    var API_KEY = process.env.LOCATIONIQ_API_KEY;
    var BASE_URL = "https://us1.locationiq.com/v1/search?format=json&limit=1";
    var url = BASE_URL + "&key=" + API_KEY + "&q=" + address;
    let config = {
        method: 'get',
        url: url,
        headers: {}
    };
    await (0, axios_1.default)(config).then(function (response) {
        console.log('Here');
        console.log(response.data[0]);
        return response.data[0];
    }).catch(function (error) {
        console.log(error);
        return null;
    });
};
exports.getCoordinates = getCoordinates;
//# sourceMappingURL=GeoLocation.js.map