const mongodb = require('mongodb');
const mongoclient = mongodb.MongoClient;

async function DB(){
    const client =await mongoclient.connect('mongodb://127.0.0.1:27017/');
    const db = client.db('bank');
    if(!db){
        console.log('Database not Connected..');
    }
    return db;
}
module.exports = {DB};