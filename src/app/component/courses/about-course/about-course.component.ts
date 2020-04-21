import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from 'src/app/services/auth/auth.service';
import { tick } from '@angular/core/testing';

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

  constructor(private route: ActivatedRoute, public afs: AngularFirestore, public authServ: AuthService) {
    this.routeSubscription = route.params.subscribe(params => { this.id = params['id']; this.group = params["group"] });
  }

  async ngAfterViewInit() {
    console.log(this.frameCont);
    await this.LoadPageFromStorage();
    await (() => { this.frameCont.nativeElement.innerHTML = `<iframe style="margin-top: 10px; height: 80vh; width: 100%;" *ngIf="!showSpinner" src='${this.index_url}' frameborder="0"></iframe>` })();
    this.showSpinner = false;
  }

  async LoadPageFromStorage() {

    await this.afs.doc(`courses/${this.group}/courses/${this.id}`).get().toPromise()
      .then(doc => {
        if (!doc.exists) {
          console.log('Нет такого доумента')
        }
        else {
          this.index_url = doc.data().index_url;
          console.log(doc.data().teacher_uid)
          if(doc.data().teacher_uid == this.authServ.userData.id) {
          this.SubDisable = true; 
          }
          else {this.SubDisable = false;}

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
                time: time.seconds,
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

    console.log("Подписываемся на курс с id => " + this.id);
    }
  
}
