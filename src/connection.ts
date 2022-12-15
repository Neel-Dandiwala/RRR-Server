const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
export const connection = new MongoClient('mongodb+srv://mongodb:mongodb@rrrcluster.nluljzi.mongodb.net/?', { useNewUrlParser: true });