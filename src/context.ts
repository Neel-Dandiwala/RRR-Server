import { Request, Response } from "express";
import { Session } from "express-session";
import mongoose from "mongoose"
import { Types } from "mongoose"

class Authentication {
    authenticationID: string = ''
}

// declare module 'express-session' {
//     interface SessionData {
//             authenticationID: string
//     }
// }

export type serverContext = {
    req: Request & {
        session?: Session & {
            authenticationID? : string ;
        }
    }
    res: Response 
}