"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const connect_mongodb_session_1 = __importDefault(require("connect-mongodb-session"));
const cors_1 = __importDefault(require("cors"));
const connection_1 = require("./connection");
const web3_1 = require("./web3");
require('dotenv').config();
const main = async () => {
    const PORT = process.env.PORT || 4000;
    await connection_1.connection.connectToServer(async function (err, client) {
        if (err)
            console.log(err);
        console.log("Database Connected");
        try {
            let bc_conn = await web3_1.web3.connectToServer(function () {
                console.log("Connection Successful");
            });
            console.log(bc_conn);
        }
        catch (error) {
            console.log("Connection Error! ", error);
        }
        console.log("Latest Block Number: ");
        console.log(await web3_1.web3.getWeb3().eth.getBlockNumber());
    });
    const MongoDBStore = (0, connect_mongodb_session_1.default)(express_session_1.default);
    const sessionStore = new MongoDBStore({
        uri: 'mongodb+srv://mongodb:mongodb@rrrcluster.nluljzi.mongodb.net/rrrdatabase?retryWrites=true&w=majority',
        collection: 'session'
    });
    sessionStore.on('error', function (error) {
        console.log(error);
    });
    const app = (0, express_1.default)();
    app.set("trust proxy", true);
    app.use((0, cors_1.default)({
        origin: '*',
        credentials: true,
        methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH']
    }));
    app.use((0, express_session_1.default)({
        name: 'rrrid',
        secret: 'VriddhiSanketKrishna',
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 7,
            httpOnly: true,
            sameSite: 'lax',
        },
        store: sessionStore,
        unset: 'destroy',
        saveUninitialized: false,
        resave: false,
    }));
    app.use(express_1.default.json());
    app.use(require('./routes/Routes'));
    app.use(require('./routes/UserRoutes'));
    app.use(require('./routes/AgentRoutes'));
    app.use(require('./routes/CompanyRoutes'));
    app.use(require('./routes/AdminRoutes'));
    app.use(require('./routes/LoginRoutes'));
    app.use(require('./routes/WasteRoutes'));
    app.get("/healthz", (_, res) => {
        res.send("Health Checkup");
    });
    app.listen(PORT, () => {
        console.log("Server started on localhost:4000");
    });
};
main().catch((err) => {
    console.error(err);
});
//# sourceMappingURL=index.js.map