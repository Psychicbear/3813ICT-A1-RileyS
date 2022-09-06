import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DataService } from '../data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  usrname: String = '';
  usrpwd: String = '';
  creds = [];
  error = false
  constructor(private http: HttpClient, private dataService: DataService, private router: Router) {

   }

  showLength(str: String){
    return 'This input has ' + str.length + ' characters within it'; 
  }

  submit(){
    this.dataService.validateLogin(this.usrname, this.usrpwd).subscribe(data => {
      console.log(data)
      if(data.valid){
        this.dataService.saveUser(data)
        this.dataService.valid = true
        let userID = this.dataService.dataUser.id
        console.log(userID)
        this.router.navigate(['home'])
        //Log user in
      } else {
        this.error = true
        //Error Correction
      }
    })
  }


  ngOnInit(): void {
    if(this.dataService.valid){
      this.router.navigate(['account'])
    }
  }

}
