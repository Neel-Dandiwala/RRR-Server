"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const CompanySchema = new mongoose_1.Schema({
    companyName: {
        type: String,
        required: true
    },
    companyEmail: {
        type: String,
        required: true
    },
    companyPassword: {
        type: String,
        required: true
    },
    companyPaperPrice: {
        type: Number,
        required: true
    },
    companyPlasticPrice: {
        type: Number,
        required: true
    },
    companyElectronicPrice: {
        type: Number,
        required: true
    },
    companyMobile: {
        type: String,
        required: true
    },
    companyAddress: {
        type: String,
        required: true
    },
    companyCity: {
        type: String,
        required: true
    },
    companyState: {
        type: String,
        required: true
    },
    companyPincode: {
        type: String,
        required: true
    },
    companyLatitude: {
        type: Number,
        required: true
    },
    companyLongitude: {
        type: Number,
        required: true
    },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("Company", CompanySchema);
//# sourceMappingURL=Company.js.map