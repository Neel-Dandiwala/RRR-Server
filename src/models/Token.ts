import { TokenInfo } from "../types/TokenInfo";
import { model, Schema } from "mongoose";


const TokenSchema: Schema = new Schema({
    tokenId: {
        type: String,
        required: true
    },

    tokenUserId: {
        type: String,
        required: true
    },

    tokenName:  {
        type: String,
        required: true
    },

    tokenSymbol: {
        type: String,
        required: true
    },

    tokenExpires:  {
        type: Number,
        required: true
    },

    tokenExpiresDate: {
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

}, {timestamps: true})

export default model<TokenInfo>("Token", TokenSchema);