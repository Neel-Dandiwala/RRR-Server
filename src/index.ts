import "reflect-metadata";
import express from "express";
import session from "express-session";
import { default as connectMongoDBSession } from 'connect-mongodb-session';
import cors from "cors";
import { connection } from "./connection";
import { web3 } from "./web3";
require('dotenv').config()

declare module 'express-session' {
    interface SessionData {
            authenticationID: string
    }
}

const main = async () => {
    const PORT= process.env.PORT || 4000;

    // appDataSource.initialize();
    // let connection = require( 'connection' );
    await connection.connectToServer(async function( err:any, client:any ) {
        if (err) console.log(err);
        console.log("Database Connected");
        try {
            let bc_conn = await web3.connectToServer( function() {
                console.log("Connection Successful");
            })
            console.log(bc_conn)
        } 
        catch (error) {
            console.log("Connection Error! ", error);
        }
        // Querying the Blockchain using the Provider and Web3.js
        console.log("Latest Block Number: ");
        console.log(await web3.getWeb3().eth.getBlockNumber());
    });

    


    // const mongodb = require('mongodb');
    // const MongoClient = mongodb.MongoClient;
    // const connection = new MongoClient('mongodb+srv://mongodb:mongodb@rrrcluster.nluljzi.mongodb.net/rrrdatabase?retryWrites=true&w=majority', { useNewUrlParser: true });

    // await connection.connect(() => {
    //     const collection = connection.db('rrrdatabase').collection('test');
    //     console.log(collection);

    //     console.log("Writing data trial in MONGO");
    //     var std = new User();
    //     std.userEmail = "27";
    //     std.userName = "Xiu";
    //     console.log(std);

        //Successful Insertion

        // collection.insertOne(std, function (err, result) {
        //     if (err) throw err;
        //     console.log("ADDED" + result);
        //     connection.close();
        // });
         
    // })

    // Successful Reading

    // const collection = connection.db('rrrdatabase').collection('test');
    // const results = async () => {
    //     const items = await collection.find({}).toArray();
    //     console.log(items);
    //     connection.close();
    // }
    // results().catch((err) => {
    //     console.error(err);
    // });

    
    
    const MongoDBStore = connectMongoDBSession(session);
    const sessionStore = new MongoDBStore({
        uri: 'mongodb+srv://mongodb:mongodb@rrrcluster.nluljzi.mongodb.net/rrrdatabase?retryWrites=true&w=majority',
        collection: 'session'
    });

    sessionStore.on('error', function(error){
        console.log(error);
    })

    const app = express();
    app.set("trust proxy", true); // Enabling trust proxy for last / rightmost value

    app.use(
        cors({
            origin: '*',
            credentials: true,
            methods: ['GET','POST','DELETE','UPDATE','PUT','PATCH']
        })
    );

    app.use(session(
        {
            name: 'rrrid',
            secret: 'VriddhiSanketKrishna',
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 7,
                httpOnly: true,
                sameSite: 'lax',
                // secure: false,
                // domain: "http://localhost:8080/",
            },
            store: sessionStore,
            unset: 'destroy',
            saveUninitialized: false,
            resave: false,
        }
    ));

    app.use(express.json());
    app.use(require('./routes/Routes'));
    app.use(require('./routes/UserRoutes'));
    app.use(require('./routes/AgentRoutes'));
    app.use(require('./routes/CompanyRoutes'));
    app.use(require('./routes/AdminRoutes'));
    app.use(require('./routes/LoginRoutes'));
    app.use(require('./routes/WasteRoutes'));

    app.get("/healthz", (_, res) => {
        res.send("Health Checkup");
    })


    app.listen(PORT, () => {
        console.log("Server started on localhost:4000")
    });

};

main().catch((err) => {
    console.error(err);
});