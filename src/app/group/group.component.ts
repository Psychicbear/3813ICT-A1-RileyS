import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationStart } from '@angular/router';
import { DataService } from '../data.service';

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.css']
})
export class GroupComponent implements OnInit {
  group = -1
  channels = []
  constructor(private router: Router, private activatedRoute: ActivatedRoute, private dataService: DataService) {
   }

  ngOnInit(): void {
    this.group = parseInt(history.state.id)
    if(this.group >= 0){
      this.dataService.fetchChannels(this.dataService.id, this.group).subscribe(res => {
        console.log(res)
        this.channels = res
      })
    } else {
      this.router.navigateByUrl('/home')
    }
  }

}
