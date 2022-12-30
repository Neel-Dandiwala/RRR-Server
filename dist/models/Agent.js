"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const AgentSchema = new mongoose_1.Schema({
    agentName: {
        type: String,
        required: true
    },
    agentEmail: {
        type: String,
        required: true
    },
    agentPassword: {
        type: String,
        required: true
    },
    agentAge: {
        type: Number,
        required: true
    },
    agentMobile: {
        type: String,
        required: true
    },
    agentAddress: {
        type: String,
        required: true
    },
    agentCity: {
        type: String,
        required: true
    },
    agentState: {
        type: String,
        required: true
    },
    agentPincode: {
        type: String,
        required: true
    },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("Agent", AgentSchema);
//# sourceMappingURL=Agent.js.map