import { Waste } from "../models/Waste";
import { Args, Ctx, Field, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import { ResponseFormat } from "./Format";
import { serverContext } from "../context";
import { WasteInfo } from "../types/WasteInfo";
import { connection } from "../connection";

@ObjectType()
class WasteResponse {
    @Field(() => [ResponseFormat], { nullable: true })
    logs?: ResponseFormat[];
}

@Resolver(Waste)
export class WasteResolver{

    @Query(() => String)
    postWaste(@Ctx() {req}: serverContext) {
        console.log(req);
        return "Hoola"
    }
    
    @Mutation(() => Waste)
    async submitWaste(
        @Args('wasteData') wasteData: WasteInfo,
        @Ctx() { req }: serverContext
    ): Promise<Waste | WasteResponse> {
        let result;
        try {
            result = await connection
            .db('rrrdatabase')
            .collection('test')
            .insertOne(
                    { 
                        wasteContent: wasteData.wasteContent,
                        wasteSubmittedAt: new Date(),
                    }
                )
        } catch (err) {
                return err;
        }

        if(result.acknowledged){
            return await connection.db('rrrdatabase').collection('test').findOne({ wasteContent: wasteData.wasteContent });
        }

        return {
            logs: [
                {
                    field: "Waste Submission Failed",
                    message: "Waste was not recorded"
                }
            ]
        };
    }
}