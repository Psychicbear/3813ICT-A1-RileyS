import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DataService } from '../data.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  usrname: String = '';
  usrpwd: String = '';
  creds = [];
  constructor(private http: HttpClient, private dataService: DataService) {

   }

  showLength(str: String){
    return 'This input has ' + str.length + ' characters within it'; 
  }

  submit(){
    this.dataService.validateLogin(this.usrname, this.usrpwd).subscribe(data => {
      console.log(data)
      if(data.valid){
        this.dataService.saveUser(data)
        let userID = this.dataService.dataUser.id
        console.log(userID)
        this.dataService.fetchGroups(userID)
        //Log user in
      } else {
        //Error Correction
      }
    })
  }


  ngOnInit(): void {
  }

}
