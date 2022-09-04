import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  usrname: String = '';
  usrpwd: String = '';
  creds = [];
  constructor(private http: HttpClient) {

   }

  showLength(str: String){
    return 'This input has ' + str.length + ' characters within it'; 
  }

  submit(){
    this.http.post<any>('http://127.0.0.1:3000/api/login', { username: this.usrname, password: this.usrpwd}).subscribe(data => {
      console.log(data)
    })
  }


  ngOnInit(): void {
  }

}
