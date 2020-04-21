import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';
import { Router } from '@angular/router';
import { AngularFirestoreDocument } from '@angular/fire/firestore';

@Component({
  selector: 'app-teach-profile',
  templateUrl: './teach-profile.component.html',
  styleUrls: ['./teach-profile.component.scss']
})
export class TeachProfileComponent implements OnInit {

  @ViewChild('alert') alert: ElementRef;
  public UserData: any;
  public MyCoursesList: any = [];
  public editState: boolean = false;
  public itemToEdit: any;

  constructor(public authService: AuthService, public route: Router) { }

  async ngOnInit() {
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


  async GetMyCourses() {
    this.MyCoursesList = [];
    
    this.authService.afs.collection(`users/${this.UserData.uid}/myCourses`).get().toPromise()
    .then(Courses=>{
      Courses.forEach(async doc=>{
        let ratingList = []
        await this.authService.afs.doc(`courses/${doc.data().group_id}/courses/${doc.id}`).get().toPromise()
        .then(async CourseDoc=>{
          await this.authService.afs.collection(`courses/${doc.data().group_id}/courses/${doc.id}/students`).get().toPromise()
          .then(async Students=>{
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
            await this.MyCoursesList.push(
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

  }

  UpdateRating(student: any, course_id: string, group_id: string) {
    const progressRef: AngularFirestoreDocument<any> = this.authService.afs.doc(`courses/${group_id}/courses/${course_id}/students/${student.userID}`)
    progressRef.set({ progress: student.progress }, { merge: true });
    this.onCancel();
  }

  onEdit(item) {
    this.editState = true;
    this.itemToEdit = item;
  }
  onCancel() {
    this.editState = false;
    this.itemToEdit = null;
  }

}
