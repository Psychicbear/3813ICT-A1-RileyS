import { Component, OnInit } from '@angular/core';
import { skip, filter, map } from 'rxjs';
import { DataService } from '../data.service';
import { Router, ActivatedRoute, NavigationEnd, RouterEvent } from '@angular/router';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-hub',
  templateUrl: './hub.component.html',
  styleUrls: ['./hub.component.css']
})
export class HubComponent implements OnInit {
  closeModal: string;
  groups = [{id: "-1", name: '', participants: []}]
  delGroup = {id: "-1", name: '', participants: []}
  editGroup = {id: "-1", name: '', participants: []}
  constructor(private dataService: DataService, private router: Router, private activatedRoute: ActivatedRoute, private modalService: NgbModal) { 
    this.dataService.forceLogin()
  }

  ngOnInit(): void {
    this.dataService.reloadGroups(this.dataService.id)
    this.dataService.groups.subscribe((res) => {
      this.groups = res
    })

  }

  openGroup(groupID: string){
    console.log(groupID)
    this.router.navigateByUrl('/group', {state: {id: groupID}})
  }

  addGroup(groupName: string, channelName: string){
    console.log('Attempting to add group')
    this.dataService.newGroup(this.dataService.id, groupName, channelName).subscribe((res)=> {
      if(res.modifiedCount > 0){
        this.dataService.reloadGroups(this.dataService.id)
      }
    })
  }

  removeGroup(id: string){
    console.log('Attempting to remove group')
    this.dataService.deleteGroup(this.dataService.id, id).subscribe(res => {
      if(res.deletedCount > 0){
        this.dataService.reloadGroups(this.dataService.id)
      }
    })
  }

  updateGroup(id: string , name: string){
    this.dataService.editGroup(this.dataService.id, id, name).subscribe(res => {
      console.log({results: res})
      if(res.modifiedCount > 0){
        this.dataService.reloadGroups(this.dataService.id)
      }
    })
  }

  triggerModal(content) {
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then((res) => {
      this.closeModal = `Closed with: ${res}`;
      console.log(res)
      if(res.method == 'add'){
        this.addGroup(res.groupName, res.channelName)
      } else if(res.method=='edit' && res.name){
        this.updateGroup(res.id, res.name)
      } else if(res.method=='del', res.id){
        this.removeGroup(res.id)
      }
    }, (res) => {
      this.closeModal = `Dismissed ${this.getDismissReason(res)}`;
    });
  }
  
  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return  `with: ${reason}`;
    }
  }
}