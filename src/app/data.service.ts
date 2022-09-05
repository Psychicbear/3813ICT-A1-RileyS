import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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


  constructor(private http: HttpClient) { }

  validateLogin(username: String, password: String){
    //Check if login is valid and allow user in if true
    return this.http.post<User>(this.serverLocation + '/api/login', {username: username, password: password, valid: false})
  }

  saveUser(userData: User){
    localStorage.setItem('user', JSON.stringify(userData))
    this.dataUser = userData
  }
  
  fetchGroups(userID: number){
    this.http.post<any>(this.serverLocation + '/api/groups', {userID: userID}).subscribe((groups) => {
      console.log(groups)
    })
    //Get groups that are relevant to user
  }

  fetchChannels(){
    //Get channels that are relevant to user
  }

  fetchChannelContent(){
    //Get data within selected channel
  }  
}
