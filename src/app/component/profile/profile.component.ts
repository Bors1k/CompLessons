import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  //-----------------------------------------------------------------------------------------------------------------------------------------
  //-----------------------------------------------Методы для работы с профилем--------------------------------------------------------------

  @ViewChild('alert') alert: ElementRef; //просматриваем элемент alert, чтобы добавляеть уведомления на сайте
  public UserData: any; //данные по пользователю
  public MyCoursesList: any = []; //список курсов

  constructor(public authService: AuthService, //инжектим сервис аутентификации
              public route: Router)//инжектим для работы с роутингом
              { }

  //-----------------------------------------------Вызывается при инициализации компонента profile-------------------------------------------
  ngOnInit() {
    if (!this.authService.isLogged) { //проверка на состояние авторизации
      this.route.navigate(['/login']); //перебрасываем на логин форму
    }
    else {
      this.UserData = this.authService.userDBdata; //получаем из сервиса данные из бд на польтзователя
      if(this.UserData != null){ //если они не нулевые, то проверяем тип аккаунта и перенаправление на нужный компонент
        if (this.UserData.account_type == 'teacher') { 
          this.route.navigate(['/teach-profile']);
        }
        else if(this.UserData.account_type == 'admin'){
          this.route.navigate(['/admin-profile'])
        }
      }
      else {// если же они нулевые, то используя сервис получаем данные из БД
        this.authService.afs.doc(`users/${this.authService.userData.uid}`).get().toPromise() 
        .then(doc => {
            this.UserData = doc.data(); // присваиваем полученные данные
            if (this.UserData.account_type == 'teacher') { //проверяем тип аккаунта и перенаправление на нужный компонент
              this.route.navigate(['/teach-profile']);
            }
            else if(this.UserData.account_type == 'admin'){
              this.route.navigate(['/admin-profile'])
            }
        });
      }
    }
  }

  //-----------------------------------------------Методы обновления профиля--------------------------------------------------------------

  UpdateProfile(name, surename, uid: string){
      this.UserData.name = name; // присваимваем новые имя и фамилию
      this.UserData.surename = surename;
      localStorage.setItem('userDB',JSON.stringify(this.UserData)); //записываем новые локальные данные на устройстве
      this.authService.afs.doc(`users/${uid}`).update({ //общаемся к документу в бд по uid, после чего обновляем name и surename
        name: name,
        surename: surename
      });
      this.alert.nativeElement.innerHTML += //и вызываем уведомление, что информация обновлена
        `<div class="alert alert-success" role="alert">
        Информация успешно обновлена
        </div>`
        setTimeout(() => {
          this.alert.nativeElement.innerHTML = ''; //после 3ех секунд удаляем уведомление
        }, 3000);
  }

  //-----------------------------------------------Методы получения курсов--------------------------------------------------------------

  async GetMyCourses(){
    this.MyCoursesList = []; //обнуляем список курсов
    //Promise обращения в бд с целью получить список курсов, на которые подписан студент
    await this.authService.afs.collection(`users/${this.UserData.uid}/myCourses`).get().toPromise() 
    .then(snapshot=>{ //получаем список
      snapshot.forEach(async doc=>{ //проходимся по каждому элементу
        //на основе полученных элементов обращаемся к соответсвующим курсам и тянем из них всю нужную нам информацию
        await this.authService.afs.doc(`courses/${doc.data().group_id}/courses/${doc.id}`).get().toPromise()
        .then(async CourseDoc=>{
          //включая также успеваемость студента
          await this.authService.afs.doc(`courses/${doc.data().group_id}/courses/${doc.id}/students/${this.UserData.uid}`).get().toPromise()
          .then(rating=>{
            this.MyCoursesList.push(//пушим все данные в массив курсов
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
  }

}


