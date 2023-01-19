import { WasteInfo } from "../types/WasteInfo";
import { model, Schema } from "mongoose";


const WasteSchema: Schema = new Schema({
    wasteDescription: {
        type: String,
        required: true
    },

    wasteWeight: {
        type: Number,
        required: true
    },

    wasteUser:  {
        type: String,
        required: true
    },

    wasteUserDate: {
        type: String,
        required: true
    },

    wasteAgent:  {
        type: String,
        required: true
    },

    wasteAgentDate: {
        type: String,
        required: true
    },

    wasteCompany:  {
        type: Number,
        required: true
    },

    wasteCompanyDate: {
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

}, {timestamps: true})

export default model<WasteInfo>("Waste", WasteSchema);