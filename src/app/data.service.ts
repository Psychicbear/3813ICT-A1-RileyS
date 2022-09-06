import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, pipe } from 'rxjs';

interface User {
  id: number,
  username: string,
  birthdate: string,
  age: number,
  email: string,
  password: string,
  valid: boolean,
  admin: boolean,
  super: boolean
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  serverLocation: String = 'http://127.0.0.1:3000';
  dataUser:  User = {
    id: -1,
    username: '',
    birthdate: '',
    age: -1,
    email: '',
    password: '',
    valid: false,
    admin: false,
    super: false
  }
  groups: any[] = []
  valid: boolean = false


  constructor(private http: HttpClient, private router: Router) { 
    this.init()
    this.fetchChannels(0,2).subscribe((data) => {
      console.log(data)
    })
  }

  init(){
    let initData = this.getUser()
    if(initData != null && initData.valid){
      this.dataUser = initData
      this.valid = true
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
    return this.http.post<User>(this.serverLocation + '/api/login', {username: username, password: password, valid: false})
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
  
  fetchGroups(userID: number){
    return this.http.post<any>(this.serverLocation + '/api/groups', {userID: userID})
    //Get groups that are relevant to user
  }

  fetchChannels(groupID: number, userID: number){
    //Get channels that are relevant to user
    return this.http.post<any>(this.serverLocation + '/api/channels', {groupID: groupID, userID: userID})
  }

  fetchChannelContent(){
    //Get data within selected channel
  }  
}
