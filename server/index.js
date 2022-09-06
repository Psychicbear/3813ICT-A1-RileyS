var express = require('express');
var jsonData = require('./data.json');
console.log(jsonData);
var app = express();
let host = '127.0.0.1';
let port = 3000;
var cors = require('cors');
const { group } = require('console');
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

app.post('/api/channels', (req, res) => {
    if(!req.body){
        return res.sendStatus(400);
    }
    let data = {}
    //Finds relevant group
    let groupIndex = jsonData.groups.findIndex((i) => {
        return req.body.groupID == i.id
    })
    console.log({groupIndex: groupIndex})
    //Gets the channels associated with this group
    let groupChannels = jsonData.groups[groupIndex].channels.map((channelID) =>{
        return jsonData.channels.find((channel) => {
            return channel.id == channelID
        })
    })
    console.log({groupChannels: groupChannels})
    //If request is from admin, return all the associated channels
    if(checkAdmin(req.body.userID)){
        data.channels = groupChannels;
    } else { //Otherwise check which channels this user can view
        data.channels = groupChannels.filter((channel) => {
            channel.participants.includes(req.body.userID)
        })
    }
    console.log(data.channels)
    res.send(data)
})
function checkAdmin(userID){
    return jsonData.global.admincache.includes(userID)
}
//Check permission function which gets the user ID and the permission level required, and checks if user meets this permission level