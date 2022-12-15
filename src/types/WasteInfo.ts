import { ArgsType, Field, InputType } from "type-graphql";

@ArgsType()
@InputType()
export class WasteInfo {
    @Field()
    wasteContent: string;
    
}