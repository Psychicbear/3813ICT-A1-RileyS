const mongoUrl = 'mongodb://localhost:27017/'
const MongoClient = require('mongodb').MongoClient


console.log('test')

MongoClient.connect(mongoUrl, function (err, db){
    if (err) throw err
    var dbo = db.db('chatdb')
    dbo.createCollection('channels', (err, res) => {
        if (err) throw err
        console.log('Collection Created')
        db.close
    })
})
