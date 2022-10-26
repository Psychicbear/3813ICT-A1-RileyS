import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, pipe } from 'rxjs';
import { io, Socket } from 'socket.io-client'

interface User {
  id: string,
  username: string,
  email: string,
  valid: boolean,
  role: number
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  serverLocation: String = 'http://127.0.0.1:3000';
  dataUser:  User = {
    id: "-1",
    username: '',
    email: '',
    valid: false,
    role: 0
  }
  groups = new BehaviorSubject([])
  channels = new BehaviorSubject([])
  valid: boolean = false
  id: string = "0"
  socket: any;


  constructor(private http: HttpClient, private router: Router) { 
    this.init()
    this.socket = io('http://localhost:3000', {autoConnect: false})
    //this.socket.auth = { userID: this.id }
    this.socket.connect()
    this.socket.onAny((event, ...args) => {
      console.log(event, args)
    })
 
  }

  init(){
    let initData = this.getUser()
    console.log(initData)
    if(initData != null && initData.id){
      this.dataUser = initData
      this.valid = true
      this.id = initData.id
      this.fetchGroups(this.dataUser.id).subscribe((res)=>{
        this.groups.next(res)
      })
    } else {
      this.router.navigate(['login'])
    }
  }

  

  forceLogin(){
    if(!this.valid){
      this.router.navigate(['login'])
    }
  }
  
  validateLogin(username: String, password: String){
    //Check if login is valid and allow user in if true
    return this.http.post<User>(this.serverLocation + '/api/login', {email: username, password: password})
  }

  getUser(){
      let dataCheck = localStorage.getItem('user')
      if(dataCheck != null){
        return JSON.parse(dataCheck)
      } else {
        console.log('Error fetching data')
        return null
      }
  }

  saveUser(userData: User){
    localStorage.setItem('user', JSON.stringify(userData))
    this.dataUser = userData
  }
  
  deleteUser(userID: string, targetID: string){
    this.http.post<any>(this.serverLocation + '/api/login/deleteUser', {userID: userID, targetID: targetID}).subscribe(res => {
      if(!res.success){
        console.log(res.error)
      } else {console.log('Somehow this worked?')}
    })
  }

  fetchGroups(userID: string){
    return this.http.post<any>(this.serverLocation + '/api/groups', {userID: userID})
    //Get groups that are relevant to user
  }

  fetchGroupParticipants(groupID: string){
    return this.http.post<any>(this.serverLocation + '/api/groups/participants', {groupID: groupID})
  }

  reloadGroups(userID: string){
    console.log(userID)
    this.http.post<any>(this.serverLocation + '/api/groups', {userID: userID}).subscribe(res => {
      console.log(res)
      this.groups.next(res)
    })
  }

  reloadChannels(userID: string, groupID: string){
    console.log(userID)
    this.http.post<any>(this.serverLocation + '/api/channels', {groupID: groupID, userID: userID}).subscribe(res => {
      console.log(res)
      this.channels.next(res)
    })
  }

  fetchChannels(userID: string, groupID: string){
    //Get channels that are relevant to user
    return this.http.post<any>(this.serverLocation + '/api/channels', {groupID: groupID, userID: userID})
  }

  newGroup(userID: string, groupName: string, channelName){
    return this.http.post<any>(this.serverLocation + '/api/groups/new', {userID: userID, groupName: groupName, channelName: channelName})
  }

  editGroup(userID: string, groupID: string, name: string){
    return this.http.post<any>(this.serverLocation + '/api/groups/edit', {userID: userID, groupID: groupID, name: name})
  }

  deleteGroup(userID: string, groupID: string){
    return this.http.post<any>(this.serverLocation + '/api/groups/delete', {userID: userID, groupID: groupID})
  }

  newChannel(userID: string, groupID: string, channelName: string){
    return this.http.post<any>(this.serverLocation + '/api/channels/new', {userID: userID, groupID: groupID, channelName: channelName})
  }

  editChannel(userID: string, groupID: string, channelID: string, channelName: string){
    return this.http.post<any>(this.serverLocation + '/api/channels/edit', {userID: userID, groupID: groupID, channelID: channelID, channelName: channelName})
  }

  deleteChannel(userID: string, groupID: string, channelID: string){
    return this.http.post<any>(this.serverLocation + '/api/channels/delete', {userID: userID, groupID: groupID, channelID: channelID})
  }

  fetchChannelContent(userID: string, channelID: string){
    this.http.post<any>(this.serverLocation + '/api/channels/readMessages', {userID: userID, channelID: channelID}).subscribe(res => {
      console.log(res)
    })
    //Get data within selected channel
  }  
}
