import { Company } from "../models/Company";
import { Arg, Args, Ctx, Field, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import { ResponseFormat } from "./Format";
import { serverContext } from "../context";
import { CompanyInfo } from "../types/CompanyInfo";
import { CredentialsInput } from "../utils/CredentialsInput";
import { validation } from "../utils/validation";
import argon2 from "argon2";
import { connection } from "../connection";

@ObjectType()
class CompanyResponse {
    @Field(() => [ResponseFormat], { nullable: true })
    logs?: ResponseFormat[];

    @Field(() => Company, { nullable: true })
    company?: Company;
}

@Resolver(Company)
export class CompanyResolver {
    
    @Query(() => String)
    postCompanyTry(@Ctx() { req }: serverContext){
        console.log(req)
        return "Greetings, Company"
    }

    @Mutation(() => CompanyResponse)
    async companySignUp(
        @Args('companyData', () => CompanyInfo) companyData: CompanyInfo,
        @Ctx() { req }: serverContext
    ): Promise<CompanyResponse> {
        let credentials = new CredentialsInput();
        credentials.email = companyData.companyEmail;
        credentials.username = companyData.companyName;
        credentials.password = companyData.companyPassword;
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
                    companyName: companyData.companyName,
                    companyEmail: companyData.companyEmail,
                    companyPassword: hashedPassword,
                    companyPaperPrice: companyData.companyPaperPrice,
                    companyPlasticPrice: companyData.companyPlasticPrice,
                    companyElectronicPrice: companyData.companyElectronicPrice,
                    companyAddress: companyData.companyAddress,
                    companyCity: companyData.companyCity,
                    companyState: companyData.companyState,
                    companyPincode: companyData.companyPincode,
                }
            )
        } catch (err) {
            return err;
        }

        if(result.acknowledged){
            let company: Company = await connection.db('rrrdatabase').collection('test').findOne({ companyName: companyData.companyName });
            return { 
                logs: [
                    {
                        field: "Successful Insertion",
                        message: result.insertedId.toString(),
                    }
                ], 
                company: company
            }
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

    @Mutation(() => CompanyResponse)
    async companyLogin(
        @Arg("usernameEmail") usernameEmail: string,
        @Arg("password") password: string,
        @Ctx() { req }: serverContext
    ): Promise<CompanyResponse> {
        const company = await connection.db('rrrdatabase').collection('test').findOne(usernameEmail.includes('@') ? { companyEmail: usernameEmail } : { companyName: usernameEmail });
        if(!company){
            return {
                logs: [
                    {
                        field: "Invalid username or email",
                        message: "Such username or email does not exist"
                    }
                ]
            }
        }
        const validPassword = await argon2.verify(company.companyPassword, password);
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

        req.session.authenticationID = company._id;

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