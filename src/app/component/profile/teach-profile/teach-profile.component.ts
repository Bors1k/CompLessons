import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-teach-profile',
  templateUrl: './teach-profile.component.html',
  styleUrls: ['./teach-profile.component.scss']
})
export class TeachProfileComponent implements OnInit {

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
          if(this.UserData.account_type == 'teacher'){
            this.route.navigate(['/teach-profile']);
          }
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
  let ratingList = [];
  await this.authService.afs.collection(`users/${this.UserData.uid}/myCourses`).get().toPromise()
  .then(Courses=>{
    Courses.forEach(async doc=>{
      await this.authService.afs.doc(`courses/${doc.data().group_id}/courses/${doc.id}`).get().toPromise()
      .then(async CourseDoc=>{
        await this.authService.afs.collection(`courses/${doc.data().group_id}/courses/${doc.id}/students`).get().toPromise()
        .then(Students=>{
          Students.forEach(async rating=>{
            await this.authService.afs.doc(`users/${rating.id}`).get().toPromise()
            .then(student=>{
              ratingList.push({
                userID: rating.id,
                progress: rating.data().progress,
                name: student.data().name,
                surename: student.data().surename
              })
            })
          })
          this.MyCoursesList.push(
            {
              id: doc.id,
              metods: CourseDoc.data().MetodMaterials,
              name: CourseDoc.data().name,
              timestable: CourseDoc.data().timestable,
              ...doc.data(),
              progressList: ratingList
            });
        })
      })
    })
  })
  console.log(this.MyCoursesList);
 
}

}
