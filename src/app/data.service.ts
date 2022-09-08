import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, pipe } from 'rxjs';

interface User {
  id: number,
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
    id: -1,
    username: '',
    email: '',
    valid: false,
    role: 0
  }
  groups = new BehaviorSubject([])
  valid: boolean = false
  id: number = 0


  constructor(private http: HttpClient, private router: Router) { 
    this.init()
  }

  init(){
    let initData = this.getUser()
    if(initData != null && initData.valid){
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
    return this.http.post<User>(this.serverLocation + '/api/login', {email: username, password: password, valid: false})
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
  
  deleteUser(userID: number, targetID: number){
    this.http.post<any>(this.serverLocation + '/api/login/deleteUser', {userID: userID, targetID: targetID}).subscribe(res => {
      if(!res.success){
        console.log(res.error)
      } else {console.log('Somehow this worked?')}
    })
  }

  fetchGroups(userID: number){
    return this.http.post<any>(this.serverLocation + '/api/groups', {userID: userID})
    //Get groups that are relevant to user
  }

  fetchGroupParticipants(groupID: number){
    return this.http.post<any>(this.serverLocation + '/api/groups/participants', {groupID: groupID})
  }

  reloadGroups(userID: number){
    this.http.post<any>(this.serverLocation + '/api/groups', {userID: userID}).subscribe(res => {
      console.log(res)
      this.groups.next(res)
    })
  }

  fetchChannels(userID: number, groupID: number){
    //Get channels that are relevant to user
    return this.http.post<any>(this.serverLocation + '/api/channels', {groupID: groupID, userID: userID})
  }

  newGroup(userID: number, groupName: string){
    return this.http.post<any>(this.serverLocation + '/api/groups/new', {userID: userID, groupName: groupName})
  }

  editGroup(userID: number, group: {}){
    return this.http.post<any>(this.serverLocation + '/api/groups/edit', {userID: userID, group: group})
  }

  deleteGroup(userID: number, groupID: number){
    return this.http.post<any>(this.serverLocation + '/api/groups/delete', {userID: userID, groupID: groupID})
  }

  newChannel(userID: number, groupID: number, name: string){
    return this.http.post<any>(this.serverLocation + '/api/channels/add', {userID: userID, groupID: groupID, name: name})
  }

  editChannel(userID: number, groupID: number, channel: {}){
    return this.http.post<any>(this.serverLocation + '/api/channels/edit', {userID: userID, groupID: groupID, channel: channel})
  }

  deleteChannel(userID: number, groupID: number, channelID: number){
    return this.http.post<any>(this.serverLocation + '/api/channels/delete', {userID: userID, groupID: groupID, channelID: channelID})
  }

  fetchChannelContent(){
    //Get data within selected channel
  }  
}
