// import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, ObjectIdColumn, ObjectID } from "typeorm";
// import { User } from "./User";
// import { Agent } from "./Agent";
// import { Field, ID, ObjectType } from "type-graphql";

// @ObjectType()
// @Entity()
// export class Waste {

//     @Field(() => ID)
//     @ObjectIdColumn()
//     _id: ObjectID;

//     @Field()
//     @Column()
//     wasteContent!: string;

//     @Field(() => User)
//     @ManyToOne(() => User, (user) => user.userWaste)
//     wasteUser: User;

//     @Field(() => Agent)
//     @ManyToOne(() => Agent, (agent) => agent.agentWaste)
//     wasteAgent: Agent;

//     @Field()
//     @CreateDateColumn()
//     wasteSubmittedAt: Date;

// }