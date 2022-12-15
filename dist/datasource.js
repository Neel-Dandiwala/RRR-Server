"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appDataSource = void 0;
const typeorm_1 = require("typeorm");
exports.appDataSource = new typeorm_1.DataSource({
    type: 'mongodb',
    useNewUrlParser: true,
    url: "mongodb+srv://mongodb:mongodb@rrrcluster.nluljzi.mongodb.net/rrrdatabase?retryWrites=true&w=majority",
    ssl: true,
    logging: true,
    entities: ['dist/entities/*.js']
});
//# sourceMappingURL=datasource.js.map