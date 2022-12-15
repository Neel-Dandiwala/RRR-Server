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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WasteResolver = void 0;
const Waste_1 = require("../models/Waste");
const type_graphql_1 = require("type-graphql");
const Format_1 = require("./Format");
const WasteInfo_1 = require("../types/WasteInfo");
const connection_1 = require("../connection");
let WasteResponse = class WasteResponse {
};
__decorate([
    (0, type_graphql_1.Field)(() => [Format_1.ResponseFormat], { nullable: true }),
    __metadata("design:type", Array)
], WasteResponse.prototype, "logs", void 0);
WasteResponse = __decorate([
    (0, type_graphql_1.ObjectType)()
], WasteResponse);
let WasteResolver = class WasteResolver {
    postWaste({ req }) {
        console.log(req);
        return "Hoola";
    }
    submitWaste(wasteData, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            let result;
            try {
                result = yield connection_1.connection
                    .db('rrrdatabase')
                    .collection('test')
                    .insertOne({
                    wasteContent: wasteData.wasteContent,
                    wasteSubmittedAt: new Date(),
                });
            }
            catch (err) {
                return err;
            }
            if (result.acknowledged) {
                return yield connection_1.connection.db('rrrdatabase').collection('test').findOne({ wasteContent: wasteData.wasteContent });
            }
            return {
                logs: [
                    {
                        field: "Waste Submission Failed",
                        message: "Waste was not recorded"
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
], WasteResolver.prototype, "postWaste", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Waste_1.Waste),
    __param(0, (0, type_graphql_1.Args)('wasteData')),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [WasteInfo_1.WasteInfo, Object]),
    __metadata("design:returntype", Promise)
], WasteResolver.prototype, "submitWaste", null);
WasteResolver = __decorate([
    (0, type_graphql_1.Resolver)(Waste_1.Waste)
], WasteResolver);
exports.WasteResolver = WasteResolver;
//# sourceMappingURL=WasteResolver.js.map