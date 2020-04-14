import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  public UserData: any;

  constructor(public authService: AuthService, public route: Router) { }

  async ngOnInit() {
      if(!this.authService.isLogged){
        this.route.navigate(['/login']);
      }
      else{
        await this.authService.afs.doc(`users/${JSON.parse(localStorage.getItem('user')).uid}`).get().toPromise()
        .then(doc=>{
          if(!doc.exists){
            console.log('Нет такого доумента')
          }
          else {
            this.UserData = doc.data();
            console.log(this.UserData);
          }
        }).catch(err=>{
          console.error("Ошибка получения документа ", err);
        })
    }
  }
  UpdateProfile(uid: string){
    console.log(uid);
  }        
}


