import { User } from "../models/User";
import { Arg, Args, Ctx, Field, FieldResolver, Mutation, ObjectType, Query, Resolver, Root } from "type-graphql";
import { serverContext } from "../context";
import { ResponseFormat } from "./Format";
import { validation } from "../utils/validation";
import argon2 from "argon2";
import { connection } from "../connection";
import { CredentialsInput } from "../utils/CredentialsInput";
import { UserInfo } from "../types/UserInfo";

@ObjectType()
class UserResponse {
    @Field(() => [ResponseFormat], { nullable: true })
    logs?: ResponseFormat[];

    @Field(() => User, {nullable: true})
    user?: User;
}

@Resolver(User)
export class UserResolver{

    @FieldResolver(() => String)
    userEmail(@Root() user: User, @Ctx() {req}: serverContext) {
        console.log(req);
        return user.userEmail;
    }

    @Query(() => UserResponse)
    async postUser(@Ctx() {req}: serverContext) {
        const user = await connection.db('rrrdatabase').collection('test').findOne({ _id: req.session.authenticationID});
        console.log(req);
        return { user }
    }

    @Mutation(() => UserResponse)
    async userSignUp(
        @Args('userData', () => UserInfo) userData: UserInfo,
        @Ctx() { req }: serverContext
    ): Promise<UserResponse> {
        let credentials = new CredentialsInput();
        credentials.email = userData.userEmail;
        credentials.username = userData.userName;
        credentials.password = userData.userPassword;
        let logs = validation(credentials);
        if(logs){
            return { logs };
        }

        const hashedPassword = await argon2.hash(credentials.password);
        let result;  
        try {
            result = await connection
            .db('rrrdatabase')
            .collection('test')
            .insertOne(
                { 
                    userName: userData.userName, 
                    userEmail: userData.userEmail,
                    userPassword: hashedPassword,
                    userAge: userData.userAge,
                    userAddress: userData.userAddress,
                    userPincode: userData.userPincode,
                    userMobile: userData.userMobile,
                    userCity: userData.userCity,
                    userState: userData.userState,
                    userCreatedAt: new Date(),
                    userUpdatedAt: new Date()
                }
            )
        } catch (err) {
                return err;
        }

        if(result.acknowledged){
            logs = [
                {
                    field: "Successful Insertion",
                    message: result.insertedId.toString(),
                }
            ]
        } else {
            logs = [
                {
                    field: "Unknown Error Occurred",
                    message: "Better check with administrator",
                }
            ]
        }
        
        return { logs };

    }

    @Mutation(() => UserResponse) 
    async userLogin(
        @Arg("usernameEmail") usernameEmail: string,
        @Arg("password") password: string,
        @Ctx() { req }: serverContext
    ): Promise<UserResponse> {
        const user = await connection.db('rrrdatabase').collection('test').findOne( usernameEmail.includes('@') ? { userEmail: usernameEmail } : { userName: usernameEmail });
        if(!user) {
            return {
                logs: [
                    {
                        field: "Invalid username or email",
                        message: "Such username or email does not exist"
                    }
                ]
            }
        }

        const validPassword = await argon2.verify(user.userPassword, password);
        if (!validPassword) {
            return { 
                logs: [
                    {
                        field: "Password",
                        message: "Password is incorrect"
                    }
                ]
            }
        }

        req.session.authenticationID = user._id;

        return { 
            logs: [
                {
                    field: "Login successful",
                    message: "You have successfully logged in "+req.session.authenticationID,
                }
            ]
        };

    }
}
