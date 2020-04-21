import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  @ViewChild('alert') alert: ElementRef;
  public UserData: any;
  public MyCoursesList: any = [];

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

  UpdateProfile(name, surename, uid: string){
    if(this.authService.isLogged){
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
  async GetMyCourses(){
    this.MyCoursesList = [];
    await this.authService.afs.collection(`users/${this.UserData.uid}/myCourses`).get().toPromise()
    .then(snapshot=>{
      snapshot.forEach(async doc=>{
        await this.authService.afs.doc(`courses/${doc.data().group_id}/courses/${doc.id}`).get().toPromise()
        .then(async CourseDoc=>{
          await this.authService.afs.doc(`courses/${doc.data().group_id}/courses/${doc.id}/students/${this.UserData.uid}`).get().toPromise()
          .then(rating=>{
            this.MyCoursesList.push(
              {
                id: doc.id,
                metods: CourseDoc.data().MetodMaterials,
                name: CourseDoc.data().name,
                timestable: CourseDoc.data().timestable,
                ...doc.data(),
                ...rating.data()
              });
          })
        })
      })
    })
    console.log(this.MyCoursesList);
  }

}


