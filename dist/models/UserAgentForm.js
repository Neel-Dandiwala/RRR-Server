"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const UserAgentFormSchema = new mongoose_1.Schema({
    bookingUser: {
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
    bookingAddress: {
        type: String,
        required: true
    },
    bookingPincode: {
        type: String,
        required: true
    },
    bookingStatus: {
        type: String,
        required: true
    },
    bookingWasteId: {
        type: String,
        required: true
    },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("UserAgentForm", UserAgentFormSchema);
//# sourceMappingURL=UserAgentForm.js.map