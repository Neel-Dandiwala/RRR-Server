// import { Waste } from "./Waste";
import { UserInfo } from "../types/UserInfo";
import { model, Schema } from "mongoose";

const UserSchema: Schema = new Schema({
    userName: {
        type: String,
        required: true
    },

    userEmail:  {
        type: String,
        required: true
    },

    userPassword:  {
        type: String,
        required: true
    },

    userAge:  {
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

    userMobile:  {
        type: String,
        required: true
    },

    userCity:  {
        type: String,
        required: true
    },

    userState:  {
        type: String,
        required: true
    },

}, {timestamps: true})

export default model<UserInfo>("User", UserSchema);