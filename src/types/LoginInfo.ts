import { Document } from "mongoose";

export interface LoginInfo extends Document {
    loginEmail: string;
    loginPassword: string;
    loginRole: string;
}