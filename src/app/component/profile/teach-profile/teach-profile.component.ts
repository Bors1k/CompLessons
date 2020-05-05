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

    //-----------------------------------------------------------------------------------------------------------------------------------------
    //-----------------------------------------------Методы для работы с профилем преподавателя------------------------------------------------

  @ViewChild('alert') alert: ElementRef; //просматриваем элемент alert, чтобы добавляеть уведомления на сайте
  public UserData: any = []; //данные по пользователю
  public MyCoursesList: any = []; //список курсов
  public editState: boolean = false; //состояние изменения успеваемости
  public itemToEdit: any; //объект изменения успеваемости для сравнения

  constructor(public authService: AuthService, //инжектим сервис аутентификации
              public route: Router) //инжектим для работы с роутингом
               { }

  //-----------------------------------------------Вызывается при инициализации компонента teach-profile-------------------------------------------
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
      else { // если же они нулевые, то используя сервис получаем данные из БД
        this.authService.afs.doc(`users/${this.authService.userData.uid}`).get().toPromise()
        .then(doc => {
            this.UserData = doc.data(); // присваиваем полученные данные
            if (this.UserData.account_type == 'teacher') { //проверяем тип аккаунта и перенаправление на нужный компонен
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

  async UpdateProfile(name, surename, uid: string): Promise<boolean> {
      let bool = false;
      this.UserData.name = name; // присваимваем новые имя и фамилию
      this.UserData.surename = surename;
      localStorage.setItem('userDB',JSON.stringify(this.UserData)); //записываем новые локальные данные на устройстве
      await this.authService.afs.doc(`users/${uid}`).update({ //общаемся к документу в бд по uid, после чего обновляем name и surename
        name: name,
        surename: surename
      }).then(()=>{
        bool = true;
        this.alert.nativeElement.innerHTML += //и вызываем уведомление, что информация обновлена
          `<div class="alert alert-success" role="alert">
            Информация успешно обновлена
            </div>`
        setTimeout(() => {
          this.alert.nativeElement.innerHTML = ''; //после 3ех секунд удаляем уведомление
        }, 3000);
      }).catch(err=>{bool = false});
      return bool;
  }

  //-----------------------------------------------Методы получения курсов--------------------------------------------------------------

  async GetMyCourses() {
    let bool = false;
    let boolCount = 0;
    this.MyCoursesList = []; //обнуляем список курсов
    //Promise для получения списка курсов, для которых пользователь является преподавателей
    await this.authService.afs.collection(`users/${this.UserData.uid}/myCourses`).get().toPromise()
    .then(Courses=>{
      //проходимся по каждому курсу в списке
      Courses.forEach(async doc=>{
        let ratingList = [] //создаем локально пустой список успеваемости студентов по курсу
        //на основе полученных элементов обращаемся к соответсвующим курсам и тянем из них всю нужную нам информацию
        await this.authService.afs.doc(`courses/${doc.data().group_id}/courses/${doc.id}`).get().toPromise()
        .then(async CourseDoc=>{
          //обращаемся к списку данных студентов в курсе
          await this.authService.afs.collection(`courses/${doc.data().group_id}/courses/${doc.id}/students`).get().toPromise()
          .then(async Students=>{
            //походися по каждому студенту
            Students.forEach(async rating=>{
              //также подтягиваем некоторую основную информацию по студентам
              await this.authService.afs.doc(`users/${rating.id}`).get().toPromise()
              .then(student=>{
                //пушим данные в список успеваемости
                ratingList.push({
                  userID: rating.id,
                  progress: rating.data().progress,
                  name: student.data().name,
                  surename: student.data().surename
                })
              })
            })
            //присваиваем основную информацию по курсу
            await this.MyCoursesList.push(
            {
                id: doc.id,
                metods: CourseDoc.data().MetodMaterials,
                name: CourseDoc.data().name,
                timestable: CourseDoc.data().timestable,
                ...doc.data(),
                progressList: ratingList //а также успеваемость которую получили раньше
            });
            // и так по кругу для всех курсов, для которых пользователь является студентом
          })
        })
      })
    bool = true;
    }).catch(err=>{bool = false;boolCount++});
    return  bool;
  }

  //-----------------------------------------------Методы работы с успеваемостю--------------------------------------------------------------

  //метод обновления успевамости
  UpdateRating(student: any, course_id: string, group_id: string) {
    //записываем ссылку на документ с успеваемостью
    const progressRef: AngularFirestoreDocument<any> = this.authService.afs.doc(`courses/${group_id}/courses/${course_id}/students/${student.userID}`)
    //присваиваем  новую успеваемость
    progressRef.set({ progress: student.progress }, { merge: true });
    //вызываем метод для сокрытия интерфейса и обнуления объекта на изменение
    this.onCancel();
  }

  //метод вызываемый при двойном клике, чтобы отобразить интерфейс изменения успевамости
  onEdit(item) {
    this.editState = true; //изменяем состояние изменения
    this.itemToEdit = item; //присваиваем объект на изменение
  }

  //метод отмены изменения успевамости и сокрытия интерфейся
  onCancel() {
    this.editState = false; //изменяем состояние изменения
    this.itemToEdit = null; //обнуление объекта на изменение
  }

}
