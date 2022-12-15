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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserResolver = void 0;
const User_1 = require("../models/User");
const type_graphql_1 = require("type-graphql");
const Format_1 = require("./Format");
const validation_1 = require("../utils/validation");
const argon2_1 = __importDefault(require("argon2"));
const connection_1 = require("../connection");
const CredentialsInput_1 = require("../utils/CredentialsInput");
let UserResponse = class UserResponse {
};
__decorate([
    (0, type_graphql_1.Field)(() => [Format_1.ResponseFormat], { nullable: true }),
    __metadata("design:type", Array)
], UserResponse.prototype, "logs", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => User_1.User, { nullable: true }),
    __metadata("design:type", typeof (_a = typeof User_1.User !== "undefined" && User_1.User) === "function" ? _a : Object)
], UserResponse.prototype, "user", void 0);
UserResponse = __decorate([
    (0, type_graphql_1.ObjectType)()
], UserResponse);
let UserResolver = class UserResolver {
    userEmail(user, { req }) {
        console.log(req);
        return user.userEmail;
    }
    postUser({ req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield connection_1.connection.db('rrrdatabase').collection('test').findOne({ _id: req.session.authenticationID });
            console.log(req);
            return { user };
        });
    }
    userSignUp(userData, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            let credentials = new CredentialsInput_1.CredentialsInput();
            credentials.email = userData.userEmail;
            credentials.username = userData.userName;
            credentials.password = userData.userPassword;
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
                });
            }
            catch (err) {
                return err;
            }
            if (result.acknowledged) {
                logs = [
                    {
                        field: "Successful Insertion",
                        message: result.insertedId.toString(),
                    }
                ];
            }
            else {
                logs = [
                    {
                        field: "Unknown Error Occurred",
                        message: "Better check with administrator",
                    }
                ];
            }
            return { logs };
        });
    }
    userLogin(usernameEmail, password, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield connection_1.connection.db('rrrdatabase').collection('test').findOne(usernameEmail.includes('@') ? { userEmail: usernameEmail } : { userName: usernameEmail });
            if (!user) {
                return {
                    logs: [
                        {
                            field: "Invalid username or email",
                            message: "Such username or email does not exist"
                        }
                    ]
                };
            }
            const validPassword = yield argon2_1.default.verify(user.userPassword, password);
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
            req.session.authenticationID = user._id;
            return {
                logs: [
                    {
                        field: "Login successful",
                        message: "You have successfully logged in " + req.session.authenticationID,
                    }
                ]
            };
        });
    }
};
__decorate([
    (0, type_graphql_1.FieldResolver)(() => String),
    __param(0, (0, type_graphql_1.Root)()),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof User_1.User !== "undefined" && User_1.User) === "function" ? _b : Object, Object]),
    __metadata("design:returntype", void 0)
], UserResolver.prototype, "userEmail", null);
__decorate([
    (0, type_graphql_1.Query)(() => UserResponse),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "postUser", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => UserResponse),
    __param(0, (0, type_graphql_1.Args)('userData', () => UserInfo_1.UserInfo)),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "userSignUp", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => UserResponse),
    __param(0, (0, type_graphql_1.Arg)("usernameEmail")),
    __param(1, (0, type_graphql_1.Arg)("password")),
    __param(2, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "userLogin", null);
UserResolver = __decorate([
    (0, type_graphql_1.Resolver)(User_1.User)
], UserResolver);
exports.UserResolver = UserResolver;
//# sourceMappingURL=UserResolver.js.map