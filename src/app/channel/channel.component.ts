import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationStart } from '@angular/router';
import { DataService } from '../data.service';
import { io, Socket } from 'socket.io-client'

@Component({
  selector: 'app-channel',
  templateUrl: './channel.component.html',
  styleUrls: ['./channel.component.css']
})
export class ChannelComponent implements OnInit {
channel: string;
socket: any;
messages: any;
  constructor(private router: Router, private activatedRoute: ActivatedRoute, private dataService: DataService) { 
    this.channel = history.state.id
    this.socket = this.dataService.socket
    this.messages = []
    this.socket.emit('joinChannel', {channelID: this.channel})
    this.socket.on('getHistory', (messages) => {
      console.log(messages)
      this.messages = messages
    })
    this.socket.on('newmsg', (message) => {
      this.messages.push(message)
    })

    if(this.channel && this.channel != "-1"){
      // this.dataService.reloadChannels(this.dataService.id, this.group)
      // this.dataService.channels.subscribe(res => {
      //   this.channels = res
      // })
    } else {
      this.router.navigateByUrl('/home')
    }
  }


  sendMessage(msg){
    this.socket.emit('msg', {message: msg, user: this.dataService.dataUser.username, id: this.dataService.id})
    msg = ''
  }

  ngOnInit(): void {

  }

}
