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
        .then(CourseDoc=>{
          this.MyCoursesList.push(
            {
              id: doc.id,
              metods: CourseDoc.data().MetodMaterials,
              name: CourseDoc.data().name,
              timestable: CourseDoc.data().timestable,
              ...doc.data()
            });
        })
      })
    })
    console.log(this.MyCoursesList);
   
  }

}


