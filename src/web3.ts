import Web3 from "web3";
import fs from "fs";
import {connection} from "./connection";

let _web3: any;

export const web3 = {

    connectToServer: async function (callback: any) {
        const db = await connection.getDb();
        const collection = db.collection( 'config' );
        _web3 = await collection.findOne({
            _id: "web3"
        });
        return _web3.web3_link;
    },

    getWeb3: function() {
        return new Web3(
                new Web3.providers.HttpProvider("http://localhost:9545")
                // new Web3.providers.HttpProvider(_web3.web3_link)
            );
    } 
};

// export const web3 = new Web3(
//     // new Web3.providers.HttpProvider("http://localhost:9545")
//     new Web3.providers.HttpProvider(_web3.web3_link)
// );

export const RewardABI = JSON.parse(fs.readFileSync('blockchain/build/contracts/Reward.json', 'utf-8'));
export const TrackingABI = JSON.parse(fs.readFileSync('blockchain/build/contracts/Tracking.json', 'utf-8'));
export const ValidationABI = JSON.parse(fs.readFileSync('blockchain/build/contracts/Validation.json', 'utf-8'));
