var express = require('express');
var jsonData = require('./data.json');
var fs = require('fs')
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
        if(user.email == req.body.email && user.password == req.body.password){
            return true;
        }
    })

    data = {
        id: user ? user.id : -1,
        username: user ? user.username : '',
        email: user ? user.email : req.body.username,
        valid: user ? true : false,
        role: user ? user.role : 0
    }
    res.send(data);

});

app.post('/api/groups', (req, res) => {
    if(!req.body){
        return res.sendStatus(400);
    }
    let role = checkRole(req.body.userID)

    let data = role<=1 
        ? jsonData.groups
        : jsonData.groups.filter((group) => {
            if(group.participants.includes(res.body.userID)){
                return true
            }
        })
    res.send(data)
})

app.post('/api/groups/new', (req, res) => {
    if(!req.body){
        return res.sendStatus(400);
    }
    let role = checkRole(req.body.userID)
    if(role <= 1 && req.body.groupName){
        jsonData.groups.push({ 
            "id": jsonData.global.groupIDcount + 1,
            "name": req.body.groupName,
            "channels": [jsonData.global.channelIDcount+1],
            "participants": jsonData.global.admincache,
            "assis": [] 
        })
        jsonData.channels.push({
            "id": jsonData.global.channelIDcount+1,
            "name": "General",
            "participants": [jsonData.global.admincache]
        })
        jsonData.global.channelIDcount++
        jsonData.global.groupIDcount++
        const data = JSON.stringify(jsonData, null, 4)
        fs.writeFile('./data.json', data, 'utf-8', (err) =>{
            if(err) {
                console.log('Error writing file:  ' + err)
            } else {
                console.log('File written successfully by UserID: ' + req.body.userID)
                res.send({err: false, reload: true})
            }
        })
    }
})

//Recieves {userID, groupID}, returns {err: bool, reload: bool} to client
app.post('/api/groups/delete', (req, res) => {
    if(!req.body){
        return res.sendStatus(400);
    }
    console.log(req.body)
    let role = checkRole(req.body.userID)
    if(role<=1){
        let index = jsonData.groups.findIndex(i => {
            return i.id == req.body.groupID
        })
        jsonData.groups[index].channels.forEach(channelID => {
            jsonData.channels.splice(jsonData.channels.findIndex(i => {
                return i.id == channelID
            }), 1)
        })
        console.log({index: index})
        console.log(jsonData.groups.splice(index, 1))
        console.log(jsonData.groups)
        saveJSON(res)
    } else res.send({err: true, reload: false})
})

//Recieves {userID, group}, returns {err: bool, reload: bool}
app.post('/api/groups/edit', (req, res) => {
    if(!req.body){
        return res.sendStatus(400);
    }
    console.log(req.body.group)
    let role = checkRole(req.body.userID)
    if(role<=1){
        let index = jsonData.groups.findIndex(i =>{
            return i.id == req.body.group.id 
        })
        jsonData.groups[index] = req.body.group
        console.log(jsonData.groups[index])
        saveJSON(res)
    } else res.send({error: true, reload: false})
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
    //Gets the channels associated with this group
    let groupChannels = jsonData.groups[groupIndex].channels.map((channelID) =>{
        return jsonData.channels.find((channel) => {
            return channel.id == channelID
        })
    })
    let role = checkRole(req.body.userID)
    console.log({role: role})
    console.log({assis: jsonData.groups[groupIndex].assis})
    //If request is from super/admin, return all the associated channels
    if(role <= 1){
        data.channels = groupChannels;
        //Assis users that are assis of this group also see all associated channels
    } else if(role==2 && jsonData.groups[groupIndex].assis.includes(req.body.userID)){
        data.channels = groupChannels;
    } else {
            //Otherwise check which channels this user can view
            data.channels = groupChannels.filter((channel) => {
            channel.participants.includes(req.body.userID)
        })
    }
    res.send(data)
})


function saveJSON(respond){
    const data = JSON.stringify(jsonData, null, 4)
    fs.writeFile('./data.json', data, 'utf-8', (err) =>{
        if(err) {
            console.log('Error writing file:  ' + err)
            return respond.send({err: true, reload: false})
        } else {
            console.log('File written successfully')
            return respond.send({err: false, reload: true})
        }
    })
} 

function checkRole(userID){
    return jsonData.users.find((user)=>{
        return user.id == userID
    }).role
}
//Check permission function which gets the user ID and the permission level required, and checks if user meets this permission level