"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const AgentCompanyFormSchema = new mongoose_1.Schema({
    bookingCompany: {
        type: String,
        required: true
    },
    bookingAgent: {
        type: String,
        required: true
    },
    bookingDate: {
        type: String,
        required: true
    },
    bookingTimeSlot: {
        type: String,
        required: true
    },
    wasteIds: {
        type: [String],
        required: true
    },
    totalPlasticWeight: {
        type: Number,
        required: true
    },
    totalPaperWeight: {
        type: Number,
        required: true
    },
    totalElectronicWeight: {
        type: Number,
        required: true
    },
    bookingStatus: {
        type: String,
        required: true
    }
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("AgentCompanyForm", AgentCompanyFormSchema);
//# sourceMappingURL=AgentCompanyForm.js.map