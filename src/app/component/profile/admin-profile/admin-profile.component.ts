import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';
import { AngularFirestoreDocument } from '@angular/fire/firestore';

@Component({
  selector: 'app-admin-profile',
  templateUrl: './admin-profile.component.html',
  styleUrls: ['./admin-profile.component.scss']
})
export class AdminProfileComponent implements OnInit {

  //-----------------------------------------------------------------------------------------------------------------------------------------
  //-----------------------------------------------Методы для работы с профилем админа-------------------------------------------------------

  @ViewChild('alert') alert: ElementRef; //просматриваем элемент alert, чтобы добавляеть уведомления на сайте
  public UserData: any = []; //данные по пользователю
  public UsersList: any = []; //список пользователей
  public editState: boolean = false; //состояние изменения типа аккаунта 
  public itemToEdit: any; //объект изменения типа аккаунта для сравнения

  constructor(public authService: AuthService, //инжектим сервис аутентификации  
     public route: Router) //инжектим для работы с роутингом
     { }

  //-----------------------------------------------Вызывается при инициализации компонента admin-profile-------------------------------------------
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
    }).catch(err=>{bool = false;});
    return bool;
  }

  //-----------------------------------------------Методы получения списка пользователей----------------------------------------------------

  async GetUsersList(): Promise<boolean>{
    let bool = false;
    this.UsersList = []; //обнуляем список пользователей
    await this.authService.afs.collection(`users`).get().toPromise() //Promise списка пользователей
    .then(Users=>{
      bool = true;
      //проходимся по списку пользователей
      Users.forEach(user=>{
        this.UsersList.push(user.data()); //пушим данные в массив
      })
    }).catch(err=>{bool = false;})
    return bool;
  }
  
  
  //-----------------------------------------------Методы работы со списком пользователей--------------------------------------------------------------
  
  //метод вызываемый при двойном клике, чтобы отобразить интерфейс изменения успевамости
  onEdit(user){
    this.editState = true; //изменяем состояние изменения
    this.itemToEdit = user; //присваиваем объект на изменение
  }

  //метод отмены изменения типа аккаунта пользователя и сокрытия интерфейся
  onCancel(){
    this.editState = false; //изменяем состояние изменения
    this.itemToEdit = null; //обнуление объекта на изменение
  }

  //метод обновления типа аккаунта
  UpdateAccountType(value){
    //записываем ссылку на документ пользователя, которго изменяем
    const progressRef: AngularFirestoreDocument<any> = this.authService.afs.doc(`users/${this.itemToEdit.uid}`)
    //присваиваем  новый тип аккаунта
    progressRef.set({ account_type: value }, { merge: true });
    //вызываем метод для сокрытия интерфейса и обнуления объекта на изменение
    this.onCancel();
  }

}
