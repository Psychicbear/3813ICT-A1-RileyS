import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';

@Component({
  selector: 'app-hub',
  templateUrl: './hub.component.html',
  styleUrls: ['./hub.component.css']
})
export class HubComponent implements OnInit {
  groups: any[] = []
  constructor(private dataService: DataService) { 
  }

  ngOnInit(): void {
    this.dataService.forceLogin()
    this.dataService.fetchGroups(this.dataService.dataUser.id).subscribe((data) => {
      console.log(data)
      this.groups = data.groups
      this.dataService.groups = this.groups
    })

  }

}
