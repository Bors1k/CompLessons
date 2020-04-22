import { Component, ViewChild, ElementRef, AfterViewInit, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { AngularFirestore, AngularFirestoreDocument, } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
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
  
  DataOnAdd: boolean = false;
  editState: boolean = false;
  DateOnEdit: any;
  DayOnEdit: string;
  TimeOnEdit: string;


  constructor(private route: ActivatedRoute, 
              public afs: AngularFirestore,
              public authServ: AuthService,
              public afstorage: AngularFireStorage) //Модуль для работы с серверным хранилищем 
              {
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

  

//-----------------------------------------------------------------------------------------------------------------------------------------
//------------------------------------------------Методы для работы админа-----------------------------------------------------------------


//-------------------------------------------------Измение даты в расписании---------------------------------------------------------------

//функция вызываемая, когда мы хотим изменить дату
//подготавливает input'ы для взаимодейсвия с датой
OnDataEdit(date){
  this.DateOnEdit = date;
  const DateNow = new Date(date.seconds * 1000);

  if(DateNow.getMonth()+1<10){
    if(DateNow.getDate()<10){
    this.DayOnEdit = `${DateNow.getFullYear()}-0${DateNow.getMonth()+1}-0${DateNow.getDate()}`;
    }
    else this.DayOnEdit = `${DateNow.getFullYear()}-0${DateNow.getMonth()+1}-${DateNow.getDate()}`;
  }
  else if(DateNow.getDate()<10){
    this.DayOnEdit = `${DateNow.getFullYear()}-${DateNow.getMonth()+1}-0${DateNow.getDate()}`
  }
  else this.DayOnEdit = `${DateNow.getFullYear()}-${DateNow.getMonth()+1}-${DateNow.getDate()}`
  
  
  
  if(DateNow.getMinutes()<10){
    if(DateNow.getHours()<10){
      this.TimeOnEdit = `0${DateNow.getHours()}:0${DateNow.getMinutes()}`;
    }
    else this.TimeOnEdit = `${DateNow.getHours()}:0${DateNow.getMinutes()}`;
  }
  else if(DateNow.getHours()<10){
    this.TimeOnEdit = `0${DateNow.getHours()}:${DateNow.getMinutes()}`;
  }
  else this.TimeOnEdit = `${DateNow.getHours()}:${DateNow.getMinutes()}`;

  this.editState = true;
}

//функция вызываемая после подтверждения изменений
//вносит локально изменения в дате, и отправляет изменения в базу данных
OnDataChange(index: any, date: string,time: string){
  const courseRef: AngularFirestoreDocument<any> = this.afs.doc(`courses/${this.group}/courses/${this.id}`);
  const NewDate = new Date(date + ' ' + time);

  this.CourseInfo.timestable[index] = {
      seconds: NewDate.getTime()/1000,
      nanoseconds: 0
    };
    courseRef.set({
      timestable: this.CourseInfo.timestable
    },{merge: true});
    this.OnCancel();
}

//Отмена измения даты
//Обнуляем дату на изменение и состояние измение на false
OnCancel(){
  this.DateOnEdit = null;
  this.editState = false;
}

//Удаление даты из расписания
//вызывает alert с подтверждением, и при подтверждении удаляет локально дату и отправляет на сервер
OnDelete(index){
  const courseRef: AngularFirestoreDocument<any> = this.afs.doc(`courses/${this.group}/courses/${this.id}`);
  if(confirm("Вы уверены?")){
    this.CourseInfo.timestable.splice(index,1);
    courseRef.set({
      timestable: this.CourseInfo.timestable
    },{merge: true});
    this.OnCancel();
  }
}

//-----------------------------------------------------Добавление даты в расписание------------------------------------------------------------

//Проверяет на нулевость массив расписания и пушит локально новую дату, после чего отправляет изменеия на сервер;
  OnAddDate(date: string,time: string){
    const courseRef: AngularFirestoreDocument<any> = this.afs.doc(`courses/${this.group}/courses/${this.id}`);
    const NewDate = new Date(date + ' ' + time);
    if(this.CourseInfo.timestable == undefined || this.CourseInfo.timestable == null){
      this.CourseInfo.timestable = [];
      this.CourseInfo.timestable.push(
        {
          seconds: NewDate.getTime()/1000,
          nanoseconds: 0
        });
    }
    else{
      this.CourseInfo.timestable.push(
        {
          seconds: NewDate.getTime()/1000,
          nanoseconds: 0
        });
    }
    courseRef.set({
      timestable: this.CourseInfo.timestable
    },{merge: true});
  }

//-----------------------------------------------------Обновление основной информации курса-------------------------------------------------------

//проверяет изменяем ли мы преподавателя, 
//если нет, то мы просто отсылаем новые имя и описание на сервер
//если да, то мы отсылаем новые id преподавателя,имя и описание на сервер
  UpdateCourseInfo(name: string, description: string, teacher_uid: string) {

    const CourseRef: AngularFirestoreDocument<any> = this.afs.doc(`courses/${this.group}/courses/${this.id}`);
    const TeacherCourseRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${teacher_uid}/myCourses/${this.id}`);
    // const OldTeacherRef: 

    if (teacher_uid == "null") {
      CourseRef.set({
        name: name,
        description: description
      }, { merge: true });
    }
    else {
      CourseRef.set({
        name: name,
        description: description,
        teacher_uid: teacher_uid
      }, { merge: true });


      TeacherCourseRef.set({
        group_id: this.group
      },{merge: true});
    }

  }
  async onUploadHTML(event){ //загрузка картинки в профиль

    const file = event.target.files[0];
    var storageRef = this.afstorage.storage.ref();
    const courseRef: AngularFirestoreDocument<any> = this.afs.doc(`courses/${this.group}/courses/${this.id}`);

    var mountainImagesRef = storageRef.child(`CoursesPage/${this.id}/index.html`);
  
    await mountainImagesRef.put(file).then(function(snapshot) {
        console.log('Uploaded a blob or file!');
      });   
    await mountainImagesRef.getDownloadURL().then((obj)=>{
      this.index_url = obj;
    })
    await courseRef.set({
      index_url: this.index_url
    },{merge: true});
    
    this.frameCont.nativeElement.innerHTML = `<iframe style="margin-top: 10px; height: 80vh; width: 100%;" *ngIf="!showSpinner" src='${this.index_url}' frameborder="0"></iframe>`

   }

//-----------------------------------------------------------------------------------------------------------------------------------------
//------------------------------------------------Методы для общей работы странички--------------------------------------------------------
  async LoadPageFromStorage() {

    await this.afs.doc(`courses/${this.group}/courses/${this.id}`).get().toPromise()
      .then(doc => {
        if (!doc.exists) {
          console.log('Нет такого доумента')
        }
        else {
          this.index_url = doc.data().index_url;
          if (this.authServ.userDBdata.account_type == 'teacher') {
            this.SubDisable = true;
          }

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
  }

}
