"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationABI = exports.TrackingABI = exports.RewardABI = exports.web3 = void 0;
const web3_1 = __importDefault(require("web3"));
const fs_1 = __importDefault(require("fs"));
exports.web3 = new web3_1.default(new web3_1.default.providers.HttpProvider("https://827e-115-96-216-232.ngrok.io"));
exports.RewardABI = JSON.parse(fs_1.default.readFileSync('blockchain/build/contracts/Reward.json', 'utf-8'));
exports.TrackingABI = JSON.parse(fs_1.default.readFileSync('blockchain/build/contracts/Tracking.json', 'utf-8'));
exports.ValidationABI = JSON.parse(fs_1.default.readFileSync('blockchain/build/contracts/Validation.json', 'utf-8'));
//# sourceMappingURL=web3.js.map