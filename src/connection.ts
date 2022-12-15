const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
export const connection = new MongoClient('mongodb+srv://mongodb:mongodb@rrrcluster.nluljzi.mongodb.net/rrrdatabase?retryWrites=true&w=majority', { useNewUrlParser: true });