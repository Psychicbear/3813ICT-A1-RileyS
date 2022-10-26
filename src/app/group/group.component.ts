import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationStart } from '@angular/router';
import { DataService } from '../data.service';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.css']
})
export class GroupComponent implements OnInit {
  group = "-1"
  channels = []
  editChannel = {id: "-1", name: ""}
  delChannel = {id: "-1", name: ""}
  closeModal:string
  constructor(private router: Router, private activatedRoute: ActivatedRoute, private dataService: DataService, private modalService: NgbModal) {
   }

  ngOnInit(): void {
    this.group = history.state.id
    console.log(this.group)
    if(this.group && this.group != "-1"){
      this.dataService.reloadChannels(this.dataService.id, this.group)
      this.dataService.channels.subscribe(res => {
        this.channels = res
      })
    } else {
      this.router.navigateByUrl('/home')
    }
  }

  addChannel(name: string){
    console.log('Attempting to add channel')
    this.dataService.newChannel(this.dataService.id, this.group, name).subscribe(res => {
      console.log({results: res})
      if(res.insertedId){
        this.dataService.reloadChannels(this.dataService.id, this.group)
      }
    })
  }

  updateChannel(channelID: string , channelName: string){
    this.dataService.editChannel(this.dataService.id, this.group, channelID, channelName).subscribe(res => {
      console.log({results: res})
      if(res.modifiedCount > 0){
        this.dataService.reloadChannels(this.dataService.id, this.group)
      }
    })
  }

  removeChannel(channelID: string){
    console.log('Attempting to remove channel')
    this.dataService.deleteChannel(this.dataService.id, this.group, channelID).subscribe(res => {
      if(res.deletedCount > 0){
        this.dataService.reloadChannels(this.dataService.id, this.group)
      }
    })
  }

  openChat(channelID: string){
    this.router.navigateByUrl('/channel', {state: {id: channelID}})
  }

  triggerModal(content) {
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then((res) => {
      console.log(res)
      if(res.method == 'add'){
        this.addChannel(res.channelName)
      } else if(res.method == 'edit'){
        this.updateChannel(res.channelID, res.channelName)
      } else if(res.method == 'del'){
        this.removeChannel(res.channelID)
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
