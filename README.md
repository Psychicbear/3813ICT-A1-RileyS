# 3813ICT-A1-RileyS
Phase 1 of the 3813ICT major project
# Git
### Git Layout
The git repository contains the Angular project in the root folder, and the node server within the ./server directory. The default branch is `main` as the default branch convention of Github

### Version Control Approach
During the development of this application, commits were made typically after a major feature had been written and tested. It was ensured that the app worked entirely as expected before changes were committed.

# Data Structures
There is a variety of data structures used within the program, with the main data structures being related to the requests sent between the angular client and node server.

As of now, the server loads data off of a local JSON file and parses it into 4 structures:

`Global` is an object containing incremental counters for the various ID types used. It uses `userIDcount`, `groupIDcount` and `channelIDcount` to provide unique IDs to all important types, and also uses `admincache` to store all usersIDs which have a permission level of Group Admin or super.

`Users` is an array that contains all users as an object. This user object has an `id`, `username`, `email`, `password`, `valid` boolean, and `role` 

`Groups`is an array that contains all groups as objects, with their properties being an id, name, channels list, participants list and assist list.

# REST API
## API route
All API calls are to be sent to the route at `./api/` to specify their purpose as REST API calls
## User Accounts
### Login
|||
|:--|:--|
|**Description**|This route authenticates user login requests. If authentication succeeds then the user is logged in, and otherwise returns a default invalid user|
|**Route**|`/api/login`|
|**Method**|`POST`|
|**Parameters**|`{ email: string, password: string }`|
|**Return Value**|`{ id: number, username: string, email: string, valid: boolean}`|
|**Technical Explanation**|The route recieves a email and password and finds a user with a matching email and password. If a match is found, the respective user's data ***(not including password)*** is sent back, but if it fails, a default user object is sent with `user.valid = false` |

### Add User
|||
|:--|:--|
|**Description**|This route registers a new user to the user database, allowing them to access the app|
|**Route**|`/api/login/add`|
|**Method**|`POST`|
|**Parameters**|`{ username: string, email: string, password: string}`|
|**Return Value**|`{ success: boolean, error: string }`|
|**Technical Explanation**|The route recieves the necessary information to construct a user object, and then generates the necessary id and default role of 0|

### Edit User
|||
|:--|:--|
|**Description**|This route allows the modification of user data|
|**Route**|`/api/login/edit`|
|**Method**|`POST`|
|**Parameters**|`{ userID: number, username: string, email: string, password: string  }`|
|**Return Value**| `{ success: boolean, error: string }` |
|**Technical Explanation**|The route edits a user's information essentially by completely overwriting it. As of now it is simply a blanket solution for editing user data|
### Delete User
|||
|:--|:--|
|**Description**|Removes a user from the user database, disallowing them from logging in again with the same credentials|
|**Route**|`/api/login/delete`|
|**Method**|`POST`|
|**Parameters**|`{ userID: number, targetID: number }`|
|**Return Value**|`{ success: boolean, error: string}`|
|**Technical Explanation**|This route first checks the userID to see if it has permission to delete users, then it checks to make sure the userID actually has the permission to delete the targetID. If the user has permission, the target user is spliced from the users array|

## Groups
### Fetch Groups
|||
|:--|:--|
|**Description**|Grabs all of the groups that the user is allowed to participate in|
|**Route**|`/api/groups`|
|**Method**|`POST`|
|**Parameters**| `{ userID: number }` |
|**Return Value**|`groups[]`|
|**Technical Explanation**|The route first checks the userID to see if they are an admin. All admins have access to all groups so if this succeeds, every group is sent back. If the user isn't an admin, the server checks the participant array of each group and returns every group that includes the userID in the participant array|
### Add Group
|||
|:--|:--|
|**Description**|Creates a new group with the specified name|
|**Route**|`/api/groups/new`|
|**Method**|`POST`|
|**Parameters**|`{ userID: userID, name: string }`|
|**Return Value**|`{ success: boolean, error: string }`|
|**Technical Explanation**|The route checks the userID to see if they have permission to create a new group. If the user has permission, the server creates a new group with the specified name and adds it to the groups array, also creating a channel with the name `General` which is linked to the group|

### Edit Group
|||
|:--|:--|
|**Description**|Edits the specified group|
|**Route**|`/api/groups/edit`|
|**Method**|`POST`|
|**Parameters**|`{ userID: string, group: group Object }`|
|**Return Value**|`{ success: boolean, error: string }`|
|**Technical Explanation**|As a blanket solution to group editing, the route simply takes the userID and checks if they are permitted to edit the group. If it succeeds, the server will overwrite the group with the new group sent in the request|

### Delete Group
|||
|:--|:--|
|**Description**|Deletes the group specified by the user|
|**Route**|`/api/groups/delete`|
|**Method**|`POST`|
|**Parameters**|`{ userID: number, groupID: number }`|
|**Return Value**|`{ success: boolean, error: string }`|
|**Technical Explanation**|The route recieves the groupID and userID, and checks if the user has permission to delete the group. If this succeeds, the server splices the group from the groups array, and additionally splices channels from the channels array that were associated with that group|

## Channels
### Fetch Channels
|||
|:--|:--|
|**Description**|Retrieves the channels relevant to the group and user|
|**Route**|`/api/channels`|
|**Method**|`POST`|
|**Parameters**|`{ groupID: number, userID: number }`|
|**Return Value**|`{ channels[]: channel Object }`|
|**Technical Explanation**|The route first loads all the channels associated with the groupID. It then checks which of these channels the userID participates in. Super, Group Admins, and Group Assis of the group are automatically given all channels.|

### Add Channel
|||
|:--|:--|
|**Description**|Adds a channel to the current group|
|**Route**|`/api/channels/new`|
|**Method**|`POST`|
|**Parameters**|`{ userID: number, groupID: number, name: string }`|
|**Return Value**|`{ success: boolean, error: string }`|
|**Technical Explanation**|The route checks if the user is permitted to add a channel to respective group. If the user has permission, a new channel with the provided name is added to the channels array, as well as added to the group's channel list|

### Edit Channel
|||
|:--|:--|
|**Description**|Edits the indicated channel|
|**Route**|`/api/channels/edit`|
|**Method**|`POST`|
|**Parameters**|`{ userID: number, groupID: number, channel: channel Object }`|
|**Return Value**|`{ success: boolean, error: string }`|
|**Technical Explanation**|As a blanket solution to editing for now, the route simply checks the user's permission level, and replaces the channel with the provided new channel data within the channels array|

### Delete Channel
|||
|:--|:--|
|**Description**|Deletes the indicated channel from the group|
|**Route**|`/api/channels/delete`|
|**Method**|`POST`|
|**Parameters**|`{ userID: number, groupID: number, channelID: number }`|
|**Return Value**|`{ success: boolean, error: string }`|
|**Technical Explanation**|The route first checks userID permission. If it passes, the server splices the channel from the channel array, and additionally splices the channelID from the group's channel list|

## Chat
### Read Message
|||
|:--|:--|
|**Description**|Fetches all messages from the indicated channel|
|**Route**|`/api/channels/readMessages`|
|**Method**|`POST`|
|**Parameters**|`{ userID: number, channelID: number}`|
|**Return Value**|`{ messages[]: message Object}`|
|**Technical Explanation**|The route checks if the userID is a participant of the channel, and if this passes the server will load the chat log for the channel from a json and send the messages to the client|

### Send Message
|||
|:--|:--|
|**Description**|Sends a message to the indicated channel|
|**Route**|`/api/channels/sendMessage`|
|**Method**|`POST`|
|**Parameters**|`{ userID: number, content: string, channelID: number }`|
|**Return Value**|`{ success: boolean, error: string }`|
|**Technical Explanation**|The route constucts a message object with the userID, content and a datetime. It then saves the message to the beginning of the messages of the respective channel log|

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 13.3.0.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
