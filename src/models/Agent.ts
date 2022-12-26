// import { Waste } from "./Waste";
import { AgentInfo } from "../types/AgentInfo";
import { model, Schema } from "mongoose";

const AgentSchema: Schema = new Schema({

    agentName:  {
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

    agentAge:  {
        type: Number,
        required: true
    },

    agentMobile:  {
        type: String,
        required: true
    },

    agentAddress:  {
        type: String,
        required: true
    },

    agentCity:  {
        type: String,
        required: true
    },

    agentState: {
        type: String,
        required: true
    },

    agentPincode:  {
        type: String,
        required: true
    },
}, {timestamps: true})

export default model<AgentInfo>("Agent", AgentSchema);