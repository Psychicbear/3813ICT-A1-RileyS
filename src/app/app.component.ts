import { Component } from '@angular/core';
import { DataService } from './data.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'phase1';

  constructor(private dataService: DataService, private router: Router){

  }

  accountStatus(){
    return this.dataService.valid
  }

  clearStorage(){
    localStorage.clear()
    window.location.reload()
  }
}
