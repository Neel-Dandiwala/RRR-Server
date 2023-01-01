import { Document } from "mongoose";

export class LoginInfo {
    loginEmail: string;
    loginPassword: string;
    loginRole: string;
}