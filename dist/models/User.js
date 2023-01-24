"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const UserSchema = new mongoose_1.Schema({
    userName: {
        type: String,
        required: true
    },
    userEmail: {
        type: String,
        required: true
    },
    userPassword: {
        type: String,
        required: true
    },
    userAge: {
        type: Number,
        required: true
    },
    userAddress: {
        type: String,
        required: true
    },
    userPincode: {
        type: String,
        required: true
    },
    userMobile: {
        type: String,
        required: true
    },
    userCity: {
        type: String,
        required: true
    },
    userState: {
        type: String,
        required: true
    },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("User", UserSchema);
//# sourceMappingURL=User.js.map