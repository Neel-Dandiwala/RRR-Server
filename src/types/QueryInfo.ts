import { ObjectId } from 'bson';

export class QueryInfo {
    _id?: ObjectId;

    queryEmail?: string;

    queryText?: string;

    queryResponse?: string;

    querySolved?: boolean;
}