import { Component, ViewChild, ElementRef, AfterViewInit, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-about-course',
  templateUrl: './about-course.component.html',
  styleUrls: ['./about-course.component.scss']
})
export class AboutCourseComponent implements AfterViewInit {

  @ViewChild('frame') frameCont: ElementRef;
  @ViewChild('alerts') alert: ElementRef;

  id: string;
  group: string;
  private routeSubscription: Subscription;
  index_url: string;
  showSpinner: boolean = true;
  SubDisable: boolean = false;
  CourseInfo: any;
  Teachers: any = [];

  constructor(private route: ActivatedRoute, public afs: AngularFirestore, public authServ: AuthService) {
    this.routeSubscription = route.params.subscribe(params => { this.id = params['id']; this.group = params["group"] });

    this.afs.doc(`courses/${this.group}/courses/${this.id}`).get().toPromise()
      .then(doc => {
        this.CourseInfo = doc.data();
        console.log(this.CourseInfo);
      })
    this.afs.collection(`users`).get().toPromise()
      .then(Users => {
        Users.forEach(user => {
          if (user.data().account_type == "teacher") {
            this.Teachers.push(user.data());
          }
        })
      })
  }

  async ngAfterViewInit() {
    await this.LoadPageFromStorage();
    await (() => { this.frameCont.nativeElement.innerHTML = `<iframe style="margin-top: 10px; height: 80vh; width: 100%;" *ngIf="!showSpinner" src='${this.index_url}' frameborder="0"></iframe>` })();
    this.showSpinner = false;
  }

  UpdateCourseInfo(name: string, description: string, teacher_uid: string) {
    console.log(name)
    console.log(description)
    console.log(teacher_uid)

    const progressRef: AngularFirestoreDocument<any> = this.afs.doc(`courses/${this.group}/courses/${this.id}`);

    if (teacher_uid == "null") {
      progressRef.set({
        name: name,
        description: description
      }, { merge: true });
    }
    else {
      progressRef.set({
        name: name,
        description: description,
        teacher_uid: teacher_uid
      }, { merge: true });
    }

  }

  async LoadPageFromStorage() {

    await this.afs.doc(`courses/${this.group}/courses/${this.id}`).get().toPromise()
      .then(doc => {
        if (!doc.exists) {
          console.log('Нет такого доумента')
        }
        else {
          this.index_url = doc.data().index_url;
          // console.log(this.authServ.userDBdata.account_type)
          if (this.authServ.userDBdata.account_type == 'teacher') {
            this.SubDisable = true;
          }
          // else {this.SubDisable = false;}

        }
      }).catch(err => {
        console.error("Ошибка получения документа ", err);
      })

  }
  async SubOnCourse() {
    if (!this.authServ.isLogged) {
      this.alert.nativeElement.innerHTML +=
        `<div class="alert alert-warning" role="alert">
        Прежде чем записать на курс, необходимо <a routerLink="/login" class="alert-link">войти/зарегестрироватсься</a>
        </div>`
      setTimeout(() => {
        this.alert.nativeElement.innerHTML = '';
      }, 5000);
    }
    else {
      let Progress = [];
      await this.afs.doc(`courses/${this.group}/courses/${this.id}`).get().toPromise()
        .then(doc => {
          if (doc.data().timestable != undefined) {
            doc.data().timestable.forEach(time => {
              Progress.push({
                time: time,
                rating: 0
              })
            });
          }

        })

      await this.afs.doc(`courses/${this.group}/courses/${this.id}/students/${this.authServ.userData.uid}`).set({
        progress: Progress
      })

      await this.afs.doc(`users/${this.authServ.userData.uid}/myCourses/${this.id}`).set({
        group_id: this.group
      })

      this.alert.nativeElement.innerHTML +=
        `<div class="alert alert-success" role="alert">
        Запись на курс прошла успешно
        </div>`
      setTimeout(() => {
        this.alert.nativeElement.innerHTML = '';
      }, 5000);
    }

    // console.log("Подписываемся на курс с id => " + this.id);
  }

}
