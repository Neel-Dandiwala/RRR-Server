import Web3 from "web3";
import fs from "fs";

export const web3 = new Web3(
    // new Web3.providers.HttpProvider("http://localhost:9545")
    new Web3.providers.HttpProvider("https://827e-115-96-216-232.ngrok.io")
);

export const RewardABI = JSON.parse(fs.readFileSync('blockchain/build/contracts/Reward.json', 'utf-8'));
export const TrackingABI = JSON.parse(fs.readFileSync('blockchain/build/contracts/Tracking.json', 'utf-8'));
export const ValidationABI = JSON.parse(fs.readFileSync('blockchain/build/contracts/Validation.json', 'utf-8'));
