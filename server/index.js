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
    if(!req.body){
        return res.sendStatus(400);
    }
    var user = jsonData.users.find((user) => {
        if(user.username == req.body.username && user.password == req.body.password){
            console.log({ userIsAdmin: checkAdmin(user.id)})
            return true;
        }
    })

    if(!user){
        user = req.body;
    }
    res.send(user);

});

app.post('/api/groups', (req, res) => {
    if(!req.body){
        return res.sendStatus(400);
    }
    let data = { groups: [] }
    if(checkAdmin(req.body.userID)){
        data.groups = jsonData.groups
    } else {
        data.groups = jsonData.groups.filter((group) => {
            if(group.participants.includes(res.body.userID)){
                return true
            }
        })
    }
    res.send(data)

})

function checkAdmin(userID){
    return jsonData.global.admincache.includes(userID)
}
//Check permission function which gets the user ID and the permission level required, and checks if user meets this permission level