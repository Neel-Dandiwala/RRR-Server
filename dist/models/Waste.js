"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const WasteSchema = new mongoose_1.Schema({
    wasteDescription: {
        type: String,
        required: true
    },
    wasteWeight: {
        type: Number,
        required: true
    },
    wasteUser: {
        type: String,
        required: true
    },
    wasteUserDate: {
        type: String,
        required: true
    },
    wasteAgent: {
        type: String,
        required: true
    },
    wasteAgentDate: {
        type: String,
        required: true
    },
    wasteCompany: {
        type: Number,
        required: true
    },
    wasteCompanyDate: {
        type: String,
        required: true
    },
    bookingId: {
        type: String,
        required: true
    },
    wasteElectronicWeight: {
        type: Number,
        required: true
    },
    wastePaperWeight: {
        type: Number,
        required: true
    },
    wastePlasticWeight: {
        type: Number,
        required: true
    },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("Waste", WasteSchema);
//# sourceMappingURL=Waste.js.map