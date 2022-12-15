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
exports.AgentResolver = void 0;
const type_graphql_1 = require("type-graphql");
const Agent_1 = require("../models/Agent");
const Format_1 = require("./Format");
const AgentInfo_1 = require("../types/AgentInfo");
const CredentialsInput_1 = require("../utils/CredentialsInput");
const validation_1 = require("../utils/validation");
const argon2_1 = __importDefault(require("argon2"));
const connection_1 = require("../connection");
let AgentResponse = class AgentResponse {
};
__decorate([
    (0, type_graphql_1.Field)(() => [Format_1.ResponseFormat], { nullable: true }),
    __metadata("design:type", Array)
], AgentResponse.prototype, "logs", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Agent_1.Agent, { nullable: true }),
    __metadata("design:type", typeof (_a = typeof Agent_1.Agent !== "undefined" && Agent_1.Agent) === "function" ? _a : Object)
], AgentResponse.prototype, "agent", void 0);
AgentResponse = __decorate([
    (0, type_graphql_1.ObjectType)()
], AgentResponse);
let AgentResolver = class AgentResolver {
    postAgentTry({ req }) {
        console.log(req);
        return "Agent Hola";
    }
    agentSignUp(agentData, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            let credentials = new CredentialsInput_1.CredentialsInput();
            credentials.email = agentData.agentEmail;
            credentials.username = agentData.agentName;
            credentials.password = agentData.agentPassword;
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
                });
            }
            catch (err) {
                return err;
            }
            if (result.acknowledged) {
                let agent = yield connection_1.connection.db('rrrdatabase').collection('test').findOne({ agentName: agentData.agentName });
                return { agent };
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
    agentLogin(usernameEmail, password, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const agent = yield connection_1.connection.db('rrrdatabase').collection('test').findOne(usernameEmail.includes('@') ? { agentEmail: usernameEmail } : { agentName: usernameEmail });
            if (!agent) {
                return {
                    logs: [
                        {
                            field: "Invalid username or email",
                            message: "Such username or email does not exist"
                        }
                    ]
                };
            }
            const validPassword = yield argon2_1.default.verify(agent.agentPassword, password);
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
            req.session.authenticationID = agent._id;
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
], AgentResolver.prototype, "postAgentTry", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => AgentResponse),
    __param(0, (0, type_graphql_1.Args)('agentData', () => AgentInfo_1.AgentInfo)),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [AgentInfo_1.AgentInfo, Object]),
    __metadata("design:returntype", Promise)
], AgentResolver.prototype, "agentSignUp", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => AgentResponse),
    __param(0, (0, type_graphql_1.Arg)("usernameEmail")),
    __param(1, (0, type_graphql_1.Arg)("password")),
    __param(2, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], AgentResolver.prototype, "agentLogin", null);
AgentResolver = __decorate([
    (0, type_graphql_1.Resolver)(Agent_1.Agent)
], AgentResolver);
exports.AgentResolver = AgentResolver;
//# sourceMappingURL=AgentResolver.js.map