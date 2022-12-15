import { DataSource } from "typeorm";

export const appDataSource = new DataSource({
    type: 'mongodb',
    useNewUrlParser: true,
    url: "mongodb+srv://mongodb:mongodb@rrrcluster.nluljzi.mongodb.net/rrrdatabase?retryWrites=true&w=majority",
    ssl: true,
    logging: true,
    entities: ['dist/entities/*.js']
})