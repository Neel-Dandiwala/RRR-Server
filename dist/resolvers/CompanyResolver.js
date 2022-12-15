"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyResolver = void 0;
const Company_1 = require("../models/Company");
const type_graphql_1 = require("type-graphql");
const Format_1 = require("./Format");
const CompanyInfo_1 = require("../types/CompanyInfo");
const CredentialsInput_1 = require("../utils/CredentialsInput");
const validation_1 = require("../utils/validation");
const argon2_1 = __importDefault(require("argon2"));
const connection_1 = require("../connection");
let CompanyResponse = class CompanyResponse {
};
__decorate([
    (0, type_graphql_1.Field)(() => [Format_1.ResponseFormat], { nullable: true }),
    __metadata("design:type", Array)
], CompanyResponse.prototype, "logs", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Company_1.Company, { nullable: true }),
    __metadata("design:type", typeof (_a = typeof Company_1.Company !== "undefined" && Company_1.Company) === "function" ? _a : Object)
], CompanyResponse.prototype, "company", void 0);
CompanyResponse = __decorate([
    (0, type_graphql_1.ObjectType)()
], CompanyResponse);
let CompanyResolver = class CompanyResolver {
    postCompanyTry({ req }) {
        console.log(req);
        return "Greetings, Company";
    }
    companySignUp(companyData, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            let credentials = new CredentialsInput_1.CredentialsInput();
            credentials.email = companyData.companyEmail;
            credentials.username = companyData.companyName;
            credentials.password = companyData.companyPassword;
            let logs = (0, validation_1.validation)(credentials);
            if (logs) {
                return { logs };
            }
            const hashedPassword = yield argon2_1.default.hash(credentials.password);
            let result;
            try {
                result = yield connection_1.connection
                    .db('rrrdatabase')
                    .collection('test')
                    .insertOne({
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
                });
            }
            catch (err) {
                return err;
            }
            if (result.acknowledged) {
                let company = yield connection_1.connection.db('rrrdatabase').collection('test').findOne({ companyName: companyData.companyName });
                return {
                    logs: [
                        {
                            field: "Successful Insertion",
                            message: result.insertedId.toString(),
                        }
                    ],
                    company: company
                };
            }
            return {
                logs: [
                    {
                        field: "Unknown Error Occurred",
                        message: "Better check with administrator",
                    }
                ]
            };
        });
    }
    companyLogin(usernameEmail, password, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const company = yield connection_1.connection.db('rrrdatabase').collection('test').findOne(usernameEmail.includes('@') ? { companyEmail: usernameEmail } : { companyName: usernameEmail });
            if (!company) {
                return {
                    logs: [
                        {
                            field: "Invalid username or email",
                            message: "Such username or email does not exist"
                        }
                    ]
                };
            }
            const validPassword = yield argon2_1.default.verify(company.companyPassword, password);
            if (!validPassword) {
                return {
                    logs: [
                        {
                            field: "Password",
                            message: "Password is incorrect"
                        }
                    ]
                };
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
        });
    }
};
__decorate([
    (0, type_graphql_1.Query)(() => String),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CompanyResolver.prototype, "postCompanyTry", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => CompanyResponse),
    __param(0, (0, type_graphql_1.Args)('companyData', () => CompanyInfo_1.CompanyInfo)),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CompanyInfo_1.CompanyInfo, Object]),
    __metadata("design:returntype", Promise)
], CompanyResolver.prototype, "companySignUp", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => CompanyResponse),
    __param(0, (0, type_graphql_1.Arg)("usernameEmail")),
    __param(1, (0, type_graphql_1.Arg)("password")),
    __param(2, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], CompanyResolver.prototype, "companyLogin", null);
CompanyResolver = __decorate([
    (0, type_graphql_1.Resolver)(Company_1.Company)
], CompanyResolver);
exports.CompanyResolver = CompanyResolver;
//# sourceMappingURL=CompanyResolver.js.map