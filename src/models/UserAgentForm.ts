import { UserAgentFormInfo } from "../types/UserAgentFormInfo";
import { model, Schema } from "mongoose";

const UserAgentFormSchema: Schema = new Schema({
    bookingUser: {
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

    bookingAddress: {
        type: String,
        required: true
    },

    bookingPincode: {
        type: String,
        required: true
    },

    bookingStatus:  {
        type: String,
        required: true
    }

}, {timestamps: true})

export default model<UserAgentFormInfo>("UserAgentForm", UserAgentFormSchema);