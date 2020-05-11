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

  //-----------------------------------------------------------------------------------------------------------------------------------------
  //-----------------------------------------------Методы для работы с подробной информацией по курсу----------------------------------------

  @ViewChild('frame') frameCont: ElementRef; //просматриваем элемент frame, чтобы отображать html страничку с основной информацией по курсу
  @ViewChild('alerts') alert: ElementRef;  //просматриваем элемент alert, чтобы добавляеть уведомления на сайте

  id: string; //id курса
  group: string;//id группы курсов
  private routeSubscription: Subscription; //отслеживание входящих параметров при роутинге, для получения id и group
  index_url: string; //ссылка на html страничку
  showSpinner: boolean = true; //переменная для отображения spinnera во время подгрузки данных из бд

  SubDisable: boolean = false; //переменная для разрешения и запрещения записи на курс

  CourseInfo: any; //объект с информацией по курсу
  Teachers: any = []; //список преподавателей
  account_type: string = 'student';
  
  DataOnAdd: boolean = false; //переменная для отображения интерфейса добавления новой даты в расписании
  editState: boolean = false; //переменная для отображения интерфейса изменения имеющейся даты в расписании
  DateOnEdit: any; //переменная для сравнения изменяемой даты
  DayOnEdit: string; //переменная для отображения даты
  TimeOnEdit: string; //перменная для отображения времени


  constructor(private route: ActivatedRoute, // для работы с роутингом 
              public afs: AngularFirestore, //Inject Firestore service для работы с бд
              public authServ: AuthService, //инжектим сервис аутентификации
              public afstorage: AngularFireStorage) //Модуль для работы с серверным хранилищем 
  {
    //для получение id и group передаваемые при маршрутизации
    this.routeSubscription = route.params.subscribe(params => { this.id = params['id']; this.group = params["group"] });

    //получаем информацию по курсу и записываем ее в переменную
    this.afs.doc(`courses/${this.group}/courses/${this.id}`).get().toPromise()
      .then(doc => {
        this.CourseInfo = doc.data();
      })

    if(this.authServ.userDBdata.account_type != undefined){
      this.account_type = this.authServ.userDBdata.account_type;
    }  
      
    //получаем список преподавателей и записываем в переменную
    this.afs.collection(`users`).get().toPromise()
      .then(Users => {
        Users.forEach(user => {
          if (user.data().account_type == "teacher") {
            this.Teachers.push(user.data());
          }
        })
      })
  }

  //-----------------------------------------------Метод вызываемый после инициализации представления---------------------------------------
  async ngAfterViewInit() {
    //вызываем метод для получения ссылки на html документ
    await this.LoadPageFromStorage();
    //добавляем iframe с ссылкой на отображаемую страничку, чтобы ее загрузить
    await (() => { this.frameCont.nativeElement.innerHTML = `<iframe style="margin-top: 10px; height: 80vh; width: 100%;" *ngIf="!showSpinner" src='${this.index_url}' frameborder="0"></iframe>` })();
    this.showSpinner = false; //прячем spinner
  }

  


//------------------------------------------------Методы для работы админа----------------------------------------------------------------//


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

//-----------------------------------Функция вызываемая после подтверждения изменений-------------------------------------------------

//вносит локально изменения в дате, и отправляет изменения в базу данных
OnDataChange(index: any, date: string,time: string){
  //получаем ссылку на документ курса
  const courseRef: AngularFirestoreDocument<any> = this.afs.doc(`courses/${this.group}/courses/${this.id}`);
  //создаем объект типа Date, на основе передоваемый данных
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

//-----------------------------------Отмена измения даты-------------------------------------------------------------------------------

//Обнуляем дату на изменение и состояние измение на false
OnCancel(){
  this.DateOnEdit = null;
  this.editState = false;
}

//-----------------------------------------------------Удаление даты из расписания------------------------------------------------------------

//вызывает alert с подтверждением, и при подтверждении удаляет локально дату и отправляет на сервер
OnDelete(index){
   //получаем ссылку на документ курса
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

//Проверяет на нулевость массив расписания и пушит локально новую дату, после чего отправляет изменения на сервер;
  OnAddDate(date: string,time: string){
    //получаем ссылку на документ курса
    const courseRef: AngularFirestoreDocument<any> = this.afs.doc(`courses/${this.group}/courses/${this.id}`);
    //создаем объект типа Date, на основе передоваемый данных
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

    //получаем ссылку на документ курса
    const CourseRef: AngularFirestoreDocument<any> = this.afs.doc(`courses/${this.group}/courses/${this.id}`);
    //получаем ссылку на документ преподавателя
    const TeacherCourseRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${teacher_uid}/myCourses/${this.id}`);

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

  //-----------------------------------------------------Обновление html странички с основной информацией-----------------------------------------------

  async onUploadHTML(event){ 

    const file = event.target.files[0]; //получаем передаваемый файл
    var storageRef = this.afstorage.storage.ref(); //получаем ссылку на хранилище
    const courseRef: AngularFirestoreDocument<any> = this.afs.doc(`courses/${this.group}/courses/${this.id}`); //получаем ссылку документ курса

    var htmlFileRef = storageRef.child(`CoursesPage/${this.id}/index.html`); //получаем ссылку на файл в хранилище
  
    await htmlFileRef.put(file).then(function(snapshot) {//отправляем файл
        console.log('Uploaded a blob or file!');
      });   
    await htmlFileRef.getDownloadURL().then((obj)=>{//получаем ссылку на сам файл, чтобы дабавить его в бд и обновить отображаемую страничку
      this.index_url = obj;
    })
    await courseRef.set({ //обновляем ссылку в бд
      index_url: this.index_url
    },{merge: true});//отправляем новую ссылку в бд, устанавливая свойство merge => true
    //что позволяет затрагивать только указанные данные, и не изменять другие данные
    
    //обновляен отображаемую html страничку
    this.frameCont.nativeElement.innerHTML =  `<iframe style="margin-top: 10px; height: 80vh; width: 100%;"
                                           *ngIf="!showSpinner" src='${this.index_url}' frameborder="0"></iframe>`;
    

   }


//------------------------------------------------Методы для общей работы странички--------------------------------------------------------//

//------------------------------------------------Загрузка основной странички с хранилища---------------------------------------------------
  async LoadPageFromStorage() {

    await this.afs.doc(`courses/${this.group}/courses/${this.id}`).get().toPromise() //обращение к документу курса в БД 
      .then(doc => {
        if (!doc.exists) {
          console.log('Нет такого доумента')
        }
        else {
          this.index_url = doc.data().index_url; //получаем ссылку для оторбражения html странички
          if (this.authServ.userDBdata.account_type == 'teacher') {
            this.SubDisable = true; // для преподавателей отключаем возможность записаться
          }

        }
      }).catch(err => {
        console.error("Ошибка получения документа ", err);
      })

  }
  //------------------------------------------------Метод вызываемый при попытке записаться на курс-----------------------------------------------
  async SubOnCourse() {
    if (!this.authServ.isLogged) { //если мы не вошли в аккаунт, отправляется уведомление об этом
      this.alert.nativeElement.innerHTML +=
        `<div class="alert alert-warning" role="alert">
        Прежде чем записать на курс, необходимо <a routerLink="/login" class="alert-link">войти/зарегестрироватсься</a>
        </div>`
      setTimeout(() => {
        this.alert.nativeElement.innerHTML = ''; //после 5 сек оно пропадает 
      }, 5000);
    }
    else {//если все в порядке, генерируется успеваемость по имеющимся данным
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

      //после чего успеваемость добавляется в бд курса
      await this.afs.doc(`courses/${this.group}/courses/${this.id}/students/${this.authServ.userData.uid}`).set({
        progress: Progress
      })

      //добавляем курс в список курсов студента
      await this.afs.doc(`users/${this.authServ.userData.uid}/myCourses/${this.id}`).set({
        group_id: this.group
      })

      //отправляем уведомление об успешной записи на курс
      this.alert.nativeElement.innerHTML +=
        `<div class="alert alert-success" role="alert">
        Запись на курс прошла успешно
        </div>`
      setTimeout(() => {
        this.alert.nativeElement.innerHTML = ''; //закрываем уведомление через 5 сек
      }, 5000);
    }
  }

}
