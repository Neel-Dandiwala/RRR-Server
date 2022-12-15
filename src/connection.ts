// const mongodb = require('mongodb');
// const MongoClient = mongodb.MongoClient;
// const connection = async() => {
//     const _connection = new MongoClient('mongodb+srv://mongodb:mongodb@rrrcluster.nluljzi.mongodb.net/?', { useNewUrlParser: true });
//     try {
//         await _connection.connect();
//     } catch (error) {
//         console.log('Not connected')
//         throw error;
//     }
// } 

// export { connection }
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb+srv://mongodb:mongodb@rrrcluster.nluljzi.mongodb.net/?";
let _db: any;
export const connection = {

    connectToServer: function (callback: any) {
        MongoClient.connect(url, { useNewUrlParser: true }, function (err: any, client: any) {
            _db = client.db('rrrdatabase');
            return callback(err);
        });
    },

    getDb: function () {
        return _db;
    }
};
