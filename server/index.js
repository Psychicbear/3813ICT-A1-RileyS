var express = require('express');
var jsonData = require('./data.json');
var fs = require('fs')
var path = require('path')
console.log(jsonData);
var app = express();
let host = '127.0.0.1';
let port = 3000;
var cors = require('cors');
const { group } = require('console');
let groups = jsonData.groups
let channels = jsonData.channels
let users = jsonData.users
let counter = {
    channel: jsonData.global.channelIDcount, 
    group: jsonData.global.groupIDcount, 
    user: jsonData.global.userIDcount
}
let messageCache = []
app.use(cors())
app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.use(express.static(path.join(__dirname,  '../dist/phase1/')));

app.listen(port, host, (port, host) => {
    var d = new Date();
    console.log(`Server has been started at: ${d.getHours()}:${d.getMinutes()}`);
});

app.post('/api/login', (req, res) => {
    if(!req.body){
        return res.sendStatus(400);
    }
    let post = req.body
    var user = users.find((user) => {
        if(user.email == post.email && user.password == post.password){
            return true;
        }
    })

    data = {
        id: user ? user.id : -1,
        username: user ? user.username : '',
        email: user ? user.email : post.username,
        valid: user ? true : false,
        role: user ? user.role : 0
    }
    res.send(data);

});

app.post('/api/groups', (req, res) => {
    if(!req.body){
        return res.sendStatus(400);
    }
    let post = req.body
    let role = checkRole(post.userID)

    let data = role<=1 
        ? groups
        : groups.filter((group) => {
            if(group.participants.includes(post.userID)){
                return true
            }
        })
    res.send(data)
})

app.post('/api/groups/new', (req, res) => {
    if(!req.body){
        return res.sendStatus(400);
    }
    let post = req.body
    let role = checkRole(post.userID)
    if(role <= 1 && post.groupName){
        groups.push({ 
            "id": counter.group + 1,
            "name": post.groupName,
            "channels": [counter.channel+1],
            "participants": [],
            "assis": [] 
        })
        channels.push({
            "id": counter.channel+1,
            "name": "General",
            "participants": []
        })
        counter.channel++
        counter.group++
        const data = JSON.stringify(jsonData, null, 4)
        fs.writeFile('./data.json', data, 'utf-8', (err) =>{
            if(err) {
                console.log('Error writing file:  ' + err)
            } else {
                console.log('File written successfully by UserID: ' + post.userID)
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
    let post = req.body
    console.log(post)
    let role = checkRole(post.userID)
    if(role<=1){
        let index = groups.findIndex(i => {
            return i.id == post.groupID
        })
        groups[index].channels.forEach(channelID => {
            channels.splice(channels.findIndex(i => {
                return i.id == channelID
            }), 1)
        })
        console.log({index: index})
        console.log(groups.splice(index, 1))
        console.log(groups)
        saveJSON(res)
    } else res.send({err: true, reload: false})
})

//Recieves {userID, group}, returns {err: bool, reload: bool}
app.post('/api/groups/edit', (req, res) => {
    if(!req.body){
        return res.sendStatus(400);
    }
    let post = req.body
    console.log(post.group)
    let role = checkRole(post.userID)
    if(role<=1){
        let index = groups.findIndex(i =>{
            return i.id == post.group.id 
        })
        groups[index] = post.group
        console.log(groups[index])
        saveJSON(res)
    } else res.send({error: true, reload: false})
})

app.post('/api/channels', (req, res) => {
    if(!req.body){
        return res.sendStatus(400);
    }
    let post = req.body
    let data = {}
    //Finds relevant group
    let groupIndex = groups.findIndex((i) => {
        return post.groupID == i.id
    })
    //Gets the channels associated with this group
    let groupChannels = groups[groupIndex].channels.map((channelID) =>{
        return channels.find((channel) => {
            return channel.id == channelID
        })
    })
    let role = checkRole(post.userID)
    console.log({role: role})
    console.log({assis: groups[groupIndex].assis})
    //If request is from super/admin, return all the associated channels
    if(role <= 1){
        data.channels = groupChannels;
        //Assis users that are assis of this group also see all associated channels
    } else if(role==2 && groups[groupIndex].assis.includes(post.userID)){
        data.channels = groupChannels;
    } else {
            //Otherwise check which channels this user can view
            data.channels = groupChannels.filter((channel) => {
            channel.participants.includes(post.userID)
        })
    }
    res.send(data)
})

//Recieves {userID, name, groupID}, returns {err: bool, reload: bool}
app.post('/api/channels/add', (req, res) => {
    if(!req.body){
        return res.sendStatus(400);
    }
    let post = req.body
    console.log(post.groupID)
    let role = checkRole(post.userID)
    if(role<=1 || (role==2 && checkAssis(post.userID, post.groupID))){
        counter.channel++
        channels.push({
            id: counter.channel,
            name: post.name,
            participants: []
        })

        groups[groups.findIndex(group=>{return group.id == post.groupID})]
            .channels.push(counter.channel)
        saveJSON(res)
        console.log(channels)
    } else res.send({error: true, reload: false})
})

//Recieves {userID, name, channel}, returns {err: bool, reload: bool}
app.post('/api/channels/edit', (req, res) => {
    if(!req.body){
        return res.sendStatus(400);
    }
    let post = req.body
    console.log(post.groupID)
    let role = checkRole(post.userID)
    if(role<=1 || (role==2 && checkAssis(post.userID, post.groupID))){
        channels[channels.findIndex(channel => {
            return channel.id == post.channel.id
        })] = post.channel
        saveJSON(res)
        console.log(channels)
    } else res.send({error: true, reload: false})
})


//Recieves {userID, groupID, channelID}, returns {err: bool, reload: bool}
app.post('/api/channels/delete', (req, res) => {
    if(!req.body){
        return res.sendStatus(400);
    }
    let post = req.body
    console.log(post.channelID)
    let role = checkRole(post.userID)
    if(role<=1 || (role==2 && checkAssis(post.userID, post.groupID))){
        channels.splice(channels.findIndex(channel => {
            return channel.id == post.channelID
        }), 1)
        let buffer = groups[groups.findIndex(group=> {return group.id == post.groupID})]
            .participants
        console.log(buffer)
        buffer.splice(buffer.indexOf(post.channelID), 1)
        saveJSON(res)
        console.log(channels)
    } else res.send({error: true, reload: false})
})

//Recieves {userID, channelID, message}, returns {err: bool, reload: bool}
// app.post('/api/channels/readMessages', (req, res) => {
//     if(!req.body){
//         return res.sendStatus(400);
//     }
//     let post = req.body
//     console.log(post.message.content)
//     let role = checkRole(post.userID)
//     if(role<=1 
//         || role==2 && checkAssis(post.userID, post.groupID)
//         || checkParticipant(post.userID, post.channelID)){
//         channels.splice(channels.findIndex(channel => {
//             return channel.id == post.channelID
//         }), 1)
//         saveJSON(res)
//         console.log(channels)
//     } else res.send({error: true, reload: false})
// })

// //Recieves {userID, name, channelID}, returns {err: bool, reload: bool}
// app.post('/api/channels/writeMessage', (req, res) => {
//     if(!req.body){
//         return res.sendStatus(400);
//     }
//     let post = req.body
//     console.log(post.channelID)
//     let role = checkRole(post.userID)
//     if(role<=1 || (role==2 && checkAssis(post.userID, post.groupID))){
//         channels.splice(channels.findIndex(channel => {
//             return channel.id == post.channelID
//         }), 1)
//         saveJSON(res)
//         console.log(channels)
//     } else res.send({error: true, reload: false})
// })

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

function checkAssis(userID, groupID){
    return groups.find(group => {
        return group.id == groupID
    }).assis.includes(userID)
}

function checkRole(userID){
    return users.find((user)=>{
        return user.id == userID
    }).role
}

function checkParticipant(userID, channelID){
    return channels.find(channel => {
        return channel.id == channelID
    }).participants.includes(userID)
}
//Check permission function which gets the user ID and the permission level required, and checks if user meets this permission level