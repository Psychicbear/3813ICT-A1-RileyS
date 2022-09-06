import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component'
import { AccountComponent } from './account/account.component'
import { HubComponent } from './hub/hub.component';
import { GroupComponent } from './group/group.component';
import { ChannelComponent } from './channel/channel.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },    
  { path: 'login', component: LoginComponent },    
  { path: 'account', component: AccountComponent },
  { path: 'home', component: HubComponent },
  { path: 'group', component: GroupComponent },
  { path: 'channel', component: ChannelComponent }    
];

@NgModule({
  imports: [RouterModule.forRoot(routes,{ onSameUrlNavigation: 'reload' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
