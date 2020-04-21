import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';
import { AngularFirestoreDocument } from '@angular/fire/firestore';

@Component({
  selector: 'app-admin-profile',
  templateUrl: './admin-profile.component.html',
  styleUrls: ['./admin-profile.component.scss']
})
export class AdminProfileComponent implements OnInit {

  @ViewChild('alert') alert: ElementRef;
  public UserData: any = [];
  public UsersList: any = [];
  public editState: boolean = false;
  public itemToEdit: any;

  constructor(public authService: AuthService, public route: Router) { }

  ngOnInit() {
    if (!this.authService.isLogged) {
      this.route.navigate(['/login']);
    }
    else {
      this.UserData = this.authService.userDBdata;
      if(this.UserData != null){
        if (this.UserData.account_type == 'teacher') {
          this.route.navigate(['/teach-profile']);
        }
        else if(this.UserData.account_type == 'admin'){
          this.route.navigate(['/admin-profile'])
        }
      }
      else {
        this.authService.afs.doc(`users/${this.authService.userData.uid}`).get().toPromise()
        .then(doc => {
            this.UserData = doc.data();
            if (this.UserData.account_type == 'teacher') {
              this.route.navigate(['/teach-profile']);
            }
            else if(this.UserData.account_type == 'admin'){
              this.route.navigate(['/admin-profile'])
            }
        });
      }
    }
  }

  UpdateProfile(name, surename, uid: string) {
    if (this.authService.isLogged) {
      this.UserData.name = name;
      this.UserData.surename = surename;
      localStorage.setItem('userDB',JSON.stringify(this.UserData));
      this.authService.afs.doc(`users/${uid}`).update({
        name: name,
        surename: surename
      });
      this.alert.nativeElement.innerHTML +=
        `<div class="alert alert-success" role="alert">
      Информация успешно обновлена
      </div>`
      setTimeout(() => {
        this.alert.nativeElement.innerHTML = '';
      }, 3000);
    }
  }

  GetUsersList(){
    this.UsersList = [];
    this.authService.afs.collection(`users`).get().toPromise()
    .then(Users=>{
      Users.forEach(user=>{
        this.UsersList.push(user.data());
      })
    })
    console.log(this.UsersList);
  } 

  onEdit(user){
    this.editState = true;
    this.itemToEdit = user;
  }
  onCancel(){
    this.editState = false;
    this.itemToEdit = null;
  }
  UpdateAccountType(value){
    console.log(value);
    const progressRef: AngularFirestoreDocument<any> = this.authService.afs.doc(`users/${this.itemToEdit.uid}`)
    progressRef.set({ account_type: value }, { merge: true });
    this.onCancel();
  }

}
