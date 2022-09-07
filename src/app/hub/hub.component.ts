import { Component, OnInit } from '@angular/core';
import { skip, Subscribable, Subscriber } from 'rxjs';
import { DataService } from '../data.service';

@Component({
  selector: 'app-hub',
  templateUrl: './hub.component.html',
  styleUrls: ['./hub.component.css']
})
export class HubComponent implements OnInit {
  groups = [{id: -1, name: '', participants: []}]
  constructor(private dataService: DataService) { 
  }

  ngOnInit(): void {
    this.dataService.forceLogin()
    this.dataService.groups.pipe(skip(1)).subscribe((res) => {
      this.groups = res
    })


  }

  addGroup(name: string){
    console.log('Attempting to add group')
    this.dataService.newGroup(this.dataService.id, name).subscribe((res)=> {
      console.log({result: res})
      if(res.reload){
        this.dataService.reloadGroups(this.dataService.id)
        // this.dataService.fetchGroups(this.dataService.dataUser.id).subscribe((groups)=>{
        //   console.log(groups)
        //   this.dataService.groups.next(groups)
        // })
      }
    })
  }

  removeGroup(i: string){
    let index = parseInt(i)
    console.log({input: this.groups[index].id})
    console.log('Attempting to remove group')
    this.dataService.deleteGroup(this.dataService.id, this.groups[index].id).subscribe(res => {
      console.log({result: res})
      if(res.reload){
        this.dataService.reloadGroups(this.dataService.id)
      }
    })
  }

  updateGroup(i: string , name: string){
    let index = parseInt(i)
    console.log(this.groups[index].id)
    this.groups[index].name = name;
    this.dataService.editGroup(this.dataService.id, this.groups[index]).subscribe(res => {
      console.log({results: res})
      if(res.reload){
        this.dataService.reloadGroups(this.dataService.id)
      }
    })
  }
}