import { User } from "../models/User";
import {Mutation, Query, Resolver} from "type-graphql"
import { connection } from "../connection";

@Resolver()
export class TrialResolver {

    @Query(() => String)
    hello(){
        return "Anyeong";
    }

    @Query(() => [User])
    async checkMe(): Promise<User[]> {
        return await connection.db('rrrdatabase').collection('test').find({ userName: 'raj12345'}).toArray();
    }

    @Query(() => [User])
    async loginCheck(): Promise<User[]> {
        const user = await connection.db('rrrdatabase').collection('test').find( ('raj@yahoo.com').includes('@') ? { userEmail: 'raj@yahoo.com' } : { userName: 'raj@yahoo.com' }).toArray();
        return user;
    }

    @Query(() => String)
    async getAttr(): Promise<string> {
        const user = await connection.db('rrrdatabase').collection('test').findOne( ('raj@yahoo.com').includes('@') ? { userEmail: 'raj@yahoo.com' } : { userName: 'raj@yahoo.com' });
        // let data = JSON.stringify(user, ["userPassword"]);
        // let rep = (data).replace(/(userPassword)|[\":{}[\]]/g, '');
        return (user.userPassword);

    }

    @Mutation(() => Boolean)
    async tryUpload(): Promise<boolean> {
        // await connection.db('rrrdatabase').collection('test').insertOne({ userName: 'Gong', userEmail: '737373'});
        return true;
    }
}