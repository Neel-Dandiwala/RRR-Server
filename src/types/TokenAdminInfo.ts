import { ObjectId } from 'bson';

export class TokenAdminInfo {
    _id?: ObjectId;

    tokenName?: string;

    tokenSymbol?: string;

    tokenDescription?: string;

    tokenValidity?: number;

    tokenPrice?: number;

    tokenImage? : string;
}
