import { serverContext } from "../context";
import { Arg, Args, Ctx, Field, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import { Agent } from "../models/Agent";
import { ResponseFormat } from "./Format";
import { AgentInfo } from "../types/AgentInfo";
import { CredentialsInput } from "../utils/CredentialsInput";
import { validation } from "../utils/validation";
import argon2 from "argon2";
import { connection } from "../connection";

@ObjectType()
class AgentResponse {
    @Field(() => [ResponseFormat], {nullable: true})
    logs?: ResponseFormat[];

    @Field(() => Agent, {nullable: true})
    agent?: Agent;
}


@Resolver(Agent)
export class AgentResolver{

    @Query(() => String) 
    postAgentTry(@Ctx() {req}: serverContext){
        console.log(req);
        return "Agent Hola";
    }

    @Mutation(() => AgentResponse)
    async agentSignUp(
        @Args('agentData', () => AgentInfo) agentData: AgentInfo,
        @Ctx() { req }: serverContext
    ): Promise<AgentResponse> {
        let credentials = new CredentialsInput();
        credentials.email = agentData.agentEmail;
        credentials.username = agentData.agentName;
        credentials.password = agentData.agentPassword;
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
                    agentName: agentData.agentName,
                    agentEmail: agentData.agentEmail,
                    agentPassword: hashedPassword,
                    agentAge: agentData.agentAge,
                    agentMobile: agentData.agentMobile,
                    agentCity: agentData.agentCity,
                    agentState: agentData.agentState,
                    agentPincode: agentData.agentPincode,
                    agentCreatedAt: new Date(),
                    agentUpdatedAt: new Date(),
                }
            )
        } catch (err) {
            return err;
        }

        if(result.acknowledged){
            let agent: Agent = await connection.db('rrrdatabase').collection('test').findOne({ agentName: agentData.agentName });
            return { agent }
        }

        return {
            logs: [
                {
                    field: "Unknown Error Occurred",
                    message: "Better check with administrator",
                }
            ]
        }
    }

    @Mutation(() => AgentResponse)
    async agentLogin(
        @Arg("usernameEmail") usernameEmail: string,
        @Arg("password") password: string,
        @Ctx() { req }: serverContext
    ): Promise<AgentResponse> {
        const agent = await connection.db('rrrdatabase').collection('test').findOne( usernameEmail.includes('@') ? { agentEmail: usernameEmail } : { agentName: usernameEmail });
        if(!agent) {
            return {
                logs: [
                    {
                        field: "Invalid username or email",
                        message: "Such username or email does not exist"
                    }
                ]
            }
        }

        const validPassword = await argon2.verify(agent.agentPassword, password);
        if(!validPassword) {
            return {
                logs: [
                    {
                        field: "Password",
                        message: "Password is incorrect"
                    }
                ]
            }
        }

        req.session.authenticationID = agent._id;

        return {
            logs: [
                {
                    field: "Login successful",
                    message: "You have successfully logged in "
                }
            ]
        };
    }
}