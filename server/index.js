var express = require('express');
var jsonData = require('./data.json');
console.log(jsonData);
var app = express();
let host = '127.0.0.1';
let port = 3000;
var cors = require('cors');
app.use(cors())
app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.use(express.static(__dirname +  '/www'));

app.listen(port, host, (port, host) => {
    var d = new Date();
    console.log(`Server has been started at: ${d.getHours()}:${d.getMinutes()}`);
});

app.get ('/', (req, res) => {
    res.sendFile(__dirname + "/www/index.html")
});

app.post('/api/login', (req, res) => {
    console.log("Recieved request")
    console.log(req.body)
    if(!req.body){
        return res.sendStatus(400);
    }
    var user = jsonData.users.find((user) => {
        console.log(user)
        console.log(req.body)
        if(user.username == req.body.username && user.password == req.body.password){
            return true;
        }
    })

    console.log(user);
    if(!user){
        user = req.body;
    }
    res.send(user);

});

//Check permission function which gets the user ID and the permission level required, and checks if user meets this permission level