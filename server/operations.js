const { channel } = require("diagnostics_channel")
const { data } = require("jquery")
const { MongoClient, ObjectId, Timestamp } = require("mongodb")
const url = 'mongodb://localhost:27017/'

async function verifyPermissions(db, userID){
    let permit = await db.collection('users').find({
        _id: ObjectId(userID), role: {$lt: 2}
    }).toArray()

    return permit.length > 0 ? true : false
}

async function verifyAssis(db, userID, groupID){
    let permit = await db.collection('users').find({
        _id: ObjectId(userID), assis: ObjectId(groupID)
    }).toArray()

    return permit.length > 0 ? true : false
}

async function verifyParticipant(db, userID, channelID){
    let permit = await db.collection('channels').find({
        _id: ObjectId(channelID), participants: ObjectId(userID)
    }).toArray()

    return permit.length > 0 ? true : false
}

async function compareRoles(db, userID, targetID){
    let user = await db.collection('users').find({
        _id: ObjectId(userID)
    }).toArray()
    if(user[0].role == -1){
        return true
    } else {
        let target = await db.collection('users').find({
            _id: ObjectId(targetID)
        }).toArray()
        console.log((user[0].role < target[0].role) ? true : false)
        return (user[0].role < target[0].role) ? true : false
    }

}



//Takes req.body = {insert: Array[], col: string}
exports.insert = function(req, res){
    MongoClient.connect(url, (err, client) => {
        if (err) throw err
        let db = client.db('chatdb')
        let doc = req.body.insert
        db.collection(req.body.col).insertMany(docArray, (err, res) => {
            console.log('Inserted the following into the collection: ')
            console.log(doc)
            res.send(doc)
            client.close()
        })
    })
}

exports.find = function(req, res){
    MongoClient.connect(url, (err, client) => {
        if (err) throw err
        let db = client.db('chatdb')
        let doc = req.body.insert
        db.collection(req.body.col).find(req.body.query).toArray((err, found) => {
            console.log('Found the following entries: ')
            console.log(found)
            res.send(found)
            client.close()
        })
    })
}

exports.authenticate = function(req, res){
    MongoClient.connect(url, async (err, client) => {
        if (err) throw err
        let db = client.db('chatdb')
        let data = req.body
        let auth = await db.collection('users').find({
            email: data.email, 
            password: data.password
        }).toArray()

        console.log('Found the following entries: ', auth)
        res.send({
            id: auth[0]._id,
            email: auth[0].email,
            username: auth[0].username,
            role: auth[0].role,
            groups: auth[0].groups,
        })
        client.close()
    })
}

exports.createUser = function(req, res){
    MongoClient.connect(url, async (err, client) => {
        if (err) throw err
        let db = client.db('chatdb')
        let data = req.body
        let user = await db.collection('users').insertOne({
            username: data.username,
            email: data.email, 
            password: data.password,
            role: 2,
            groups: [],
            channels: [],
            assis: []
        })
        console.log('Created new user: ', user)
        res.send({
            id: user.insertedId,
            email: data.email,
            username: data.username,
            role: 2,
        })
        client.close()
    })
}

exports.deleteUser = function(req, res){
    MongoClient.connect(url, async (err, client) => {
        if (err) throw err
        let db = client.db('chatdb')
        let data = req.body
        if(
            await verifyPermissions(db, data.userID) &&
            await compareRoles(db, data.userID, data.targetID)
            ){
                console.log('Removing references to user')
                let channels = await db.collection('channels').updateMany(
                    {participants: ObjectId(data.targetID)},
                    {$pull: {participants: ObjectId(data.targetID)}}
                )
                console.log('Unlinked user from channels with status: ', channels)
                
                let groups = await db.collection('groups').updateMany(
                    {participants: ObjectId(data.targetID)},
                    {$pull: {participants: ObjectId(data.targetID)}}
                )
                console.log('Unlinked user from groups with status: ', groups)
                
                let removeUser = await db.collection('users').deleteOne({
                    _id: ObjectId(data.targetID)
                })
                console.log('Completed user delete job with status: ', removeUser)
                res.send(removeUser)
            } else {
                res.send({'error': 'You do not have permission to do that'})
            }
            client.close()
    })    
}


exports.fetchGroups = function(req, res){
    MongoClient.connect(url, async (err, client) => {
        if (err) throw err
        let db = client.db('chatdb')
        let data = req.body
        let user = await db.collection('users').find({
            _id: ObjectId(data.userID)
        }).toArray()
        console.log('Found the following entries: ', user)

        let groups = await db.collection('groups').find(
            user[0].role < 2 ? {} : {_id: {$in: user[0].groups}}
        ).toArray()
        console.log('Found the following groups: ', groups)
        
        res.send(groups.map(group => {
            return {id: group._id, name: group.name}
        }))
        client.close()
    })
}

exports.createGroup = function(req, res){
    MongoClient.connect(url, async (err, client) => {
        if (err) throw err
        let db = client.db('chatdb')

        if(await verifyPermissions(db, req.body.userID)){
            let defaultUsers = await db.collection('users').find({role: {$lt: 2}}).toArray()
            defaultUsers = defaultUsers.map(usr => {return ObjectId(usr._id)})
            console.log('Populating new group with default permitted users: ', defaultUsers)
            
            let group = await db.collection('groups').insertOne({
                name: req.body.groupName,
                participants: defaultUsers,
                channels: []
            })
            console.log('Created new group with ID: ', group.insertedId)
    
            let channel = await db.collection('channels').insertOne({
                name: req.body.channelName,
                participants: defaultUsers,
                parent: ObjectId(group.insertedId),
                default: true,
                chat: []
            })
            console.log('Created default channel for group with ID: ', channel)
    
            let groupChannelLink = await db.collection('groups').updateOne(
                {_id: ObjectId(group.insertedId)},
                {$push: {channels: ObjectId(channel.insertedId)}}
            )
            console.log('Successfully linked new group with default channel')
            res.send(groupChannelLink)
        } else {
            console.log('Permission Denied')
            res.send({'error': 'You are not permitted to do that'})
        }
        client.close()
    })
}

exports.editGroupName = function(req, res){
    MongoClient.connect(url, async (err, client) => {
        if (err) throw err
        let db = client.db('chatdb')

        if (await verifyPermissions(db, req.body.userID)){
            let update = await db.collection('groups').updateOne(
                {_id: ObjectId(req.body.groupID)},
                {$set: {name: req.body.name}}
            )
            console.log('Updated group with new name: ', update)
            res.send(update)
        } else {
            console.log('Permission Denied')
            res.send({'error': 'You are not authorised to do that'})
        }
        client.close()
    })
}

exports.deleteGroup = function(req, res){
    MongoClient.connect(url, async (err, client) => {
        if (err) throw err
        let db = client.db('chatdb')

        if (await verifyPermissions(db, req.body.userID)){
            let removeGroup = await db.collection('groups').deleteOne(
                {_id: ObjectId(req.body.groupID)},
                {$set: {name: req.body.name}}
            )
            console.log('Attempted group deletion with status: ', removeGroup)
            console.log('Now removing related relational links')

            let channels = await db.collection('channels').find({
                parent: ObjectId(req.body.groupID)
            }).toArray()
            channels = channels.map(channel => {return ObjectId(channel._id)})
            console.log('Marked the following channel IDs for deletion: ', channels)

            let removeChannels = await db.collection('channels').deleteMany({
                _id: {$in: channels}
            })
            console.log('Removed the following channels: ', removeChannels)

            let removeRelation = await db.collection('users').updateMany(
                {groups: ObjectId(req.body.groupID)},
                {$pull: {groups: ObjectId(req.body.groupID), channels: {$in: channels}, assis:ObjectId(req.body.groupID)}}
            )

            console.log('Completed cascading delete with results: ', removeRelation)
            res.send(removeGroup)
        } else {
            console.log('Permission Denied')
            res.send({'error': 'You are not authorised to do that'})
        }
        client.close()
    })
}

exports.fetchChannels = function(req, res){
    MongoClient.connect(url, async (err, client) => {
        if (err) throw err
        let db = client.db('chatdb')
        let channels = await db.collection('channels').find({
            parent: ObjectId(req.body.groupID), 
            participants: ObjectId(req.body.userID)
        }).toArray()
        console.log('Found the following channels that this user participates in: ', channels)
        let data = channels.map(channel => {
            return {
                'name': channel.name,
                'id': channel._id
            }
        })
        res.send(data)
        client.close()
    })
}

//Req.body = {groupID: ObjectId, channelName: string}
exports.createChannel =  function(req, res){
    MongoClient.connect(url, async (err, client) => {
        if (err) throw err
        let db = client.db('chatdb')
        let data = req.body

        if(
            await verifyPermissions(db, data.userID) || 
            await verifyAssis(db, data.userID, data.groupID)
            ){
            let defaultUsers = await db.collection('users').find({role: {$lt: 2}}).toArray()
            defaultUsers = defaultUsers.map(usr => {return ObjectId(usr._id)})
            console.log('Populating new channel with default permitted users: ', defaultUsers)

            let channel = await db.collection('channels').insertOne({
                name: data.channelName,
                participants: defaultUsers,
                parent: ObjectId(data.groupID),
                chat: []
            })
            console.log('Created channel with ID: ', channel.insertedId)

            let parent = await db.collection('groups').updateOne(
                {_id: ObjectId(data.groupID)},
                {$push: {channels: ObjectId(channel.insertedId)}}
            )
            console.log('Linked new channel to parent group with status: ', parent)
            console.log('Channel creation successful')
            res.send(channel)
        } else {
            res.send({'error': 'You are not authorised to do that'})
            client.close()
        }
    })
}

exports.editChannelName = function(req, res){
    MongoClient.connect(url, async (err, client) => {
        if (err) throw err
        let db = client.db('chatdb')
        let data = req.body
        if(
            await verifyPermissions(db, data.userID) || 
            await verifyAssis(db, data.userID, data.groupID)
            ){
            let update = await db.collection('channels').updateOne(
                {_id: ObjectId(data.channelID)},
                {$set: {name: data.channelName}}
            )
            console.log('Updated group with new name: ', update)
            res.send(update)
        } else {
            console.log('Permission Denied')
            res.send({'error': 'You are not authorised to do that'})
        }
        client.close()
    })
}

exports.deleteChannel = function(req, res){
    MongoClient.connect(url, async (err, client) => {
        if (err) throw err
        let db = client.db('chatdb')
        let data = req.body
        if(
            await verifyPermissions(db, data.userID) || 
            await verifyAssis(db, data.userID, data.groupID)
            ){
            console.log('Unlinking channel from related documents')

            let group = await db.collection('groups').updateOne(
                {_id: ObjectId(data.groupID)},
                {$pull: {channels: ObjectId(data.channelID)}}
            )
            console.log('Unlinked from parent group with status: ', group)

            let users = await db.collection('users').updateMany(
                {channels: ObjectId(data.channelID)},
                {$pull: {channels: ObjectId(data.channelID)}}
            )
            console.log('Unlinked from users with status: ', users)

            let removeChannel = await db.collection('channels').deleteOne(
                {_id: ObjectId(data.channelID)}
            )
            console.log('Completed channel deletion job with status: ', removeChannel)
            res.send(removeChannel)
        } else {
            console.log('Permission Denied')
            res.send({'error': 'You are not authorised to do that'})
        }
        client.close()
    })
}



exports.fetchChat = async function(channelID){
    let client = await MongoClient.connect(url)
    let db = client.db('chatdb')
    let chat = await db.collection('channels').find(
        {_id: ObjectId(channelID)}
    ).toArray()
    console.log(chat)
    if(chat.length > 0){
        chat = chat[0].chat
        console.log(chat)
    }
    client.close()
    return chat
}

exports.addMsg = async function(msg, channelID){
    console.log(msg)
    let client = await MongoClient.connect(url)
    let db = client.db('chatdb')
    let chat = await db.collection('channels').updateOne(
        {_id: ObjectId(channelID)},
        {$push: {chat: msg}}
    )
    client.close()
}

exports.sendMessage = function(req, res){
    MongoClient.connect(url, async (err, client) => {
        if (err) throw err
        let db = client.db('chatdb')
        let data = req.body
        if(
            await verifyPermissions(db, data.userID) || 
            await verifyAssis(db, data.userID, data.groupID) ||
            await verifyParticipant(db, data.userID, data.channelID)
            ){
            let message = {
                time: new Timestamp(),
                user: ObjectId(data.userID),
                message: data.message
            }
            let chat = await db.collection('channels').updateOne(
                {_id: ObjectId(data.channelID)},
                {$push: {chat: message}}
            ).toArray()
            console.log('Fetched channel with chat')
            res.send(chat[0])
        } else {
            console.log('Permission Denied')
            res.send({'error': 'You are not authorised to do that'})
        }
        client.close()
    })
}

exports.update = function(req, res){
    MongoClient.connect(url, (err, client) => {
        if (err) throw err
        let db = client.db('chatdb')
        let doc = req.body.insert
        db.collection(req.body.col, (err, collection) => {
            let queryJSON = req.params
            let updateJSON = req.body.update
            collection.updateMany(queryJSON, { $set: updateJSON }, (err, results) => {
                console.log('For the item with ', queryJSON)
                console.log('SET: ', updateJSON)
                res.send(results)
                client.close()
            })
        })
    })
}

exports.delete = function(req, res){
    MongoClient.connect(url, (err, client) => {
        if (err) throw err
        let db = client.db('chatdb')
        let doc = req.body.insert
        db.collection(req.body.col, (err, collection) => {
            let queryJSON = req.body.delete
            collection.deleteMany(queryJSON, (err, results) => {
                console.log('Removed item with: ', queryJSON)
                res.send(queryJSON)
                client.close()
            })
        })
    })
}

