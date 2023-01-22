import { AgentCompanyFormInfo } from "../types/AgentCompanyFormInfo";
import { model, Schema } from "mongoose";

const AgentCompanyFormSchema: Schema = new Schema({
    bookingCompany: {
        type: String,
        required: true
    },

    bookingAgent:  {
        type: String,
        required: true
    },

    bookingDate:  {
        type: String,
        required: true
    },

    bookingTimeSlot:  {
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

    bookingStatus:  {
        type: String,
        required: true
    }

}, {timestamps: true})

export default model<AgentCompanyFormInfo>("AgentCompanyForm", AgentCompanyFormSchema);