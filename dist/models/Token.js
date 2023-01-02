"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const TokenSchema = new mongoose_1.Schema({
    tokenId: {
        type: String,
        required: true
    },
    tokenUserId: {
        type: String,
        required: true
    },
    tokenName: {
        type: String,
        required: true
    },
    tokenSymbol: {
        type: String,
        required: true
    },
    tokenExpires: {
        type: String,
        required: true
    },
    tokenUsed: {
        type: Boolean,
        required: true
    },
    tokenAmount: {
        type: Number,
        required: true
    },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("Token", TokenSchema);
//# sourceMappingURL=Token.js.map