import { Injectable, NgZone } from '@angular/core';
import { AngularFireAuth } from "@angular/fire/auth";
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Router } from '@angular/router';

import { User } from 'src/app/interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  //-----------------------------------------------------------------------------------------------------------------------------------------
  //-----------------------------------------------Сервис для работы с авторизацией----------------------------------------------------------

  userData: any; //данные из состояния аутентификации
  userDBdata: any; //данные из состояния аутентификации
  isLogged: boolean = false;  //состояние авторизации

  constructor(
    public afs: AngularFirestore,   // Inject Firestore service для работы с бд
    public afAuth: AngularFireAuth, // Inject Firebase auth service для работы с авторизацией
    public router: Router,  // для работы с роутингом
    public ngZone: NgZone // NgZone service to remove outside scope warning
  ) {

    
    //Подписываемся на состояние аутентификации
    this.afAuth.authState.subscribe(user => {
      //Проверяем авторизованность, если мы авторизованны
      if (user) {
        this.userData = user;
        localStorage.setItem('user', JSON.stringify(this.userData));  //то сохраняем локально данные авторизации
        this.userDBdata = JSON.parse(localStorage.getItem('userDB')); //И достаем основные бд данные по пользователю из локального источника
        this.isLogged = true; //состояение авторизации делаем true

        this.router.navigate(["/profile"]);
      }
      else { 
        localStorage.setItem('user', null); // удаляем из локального источника все даннные
        localStorage.setItem('userDB', null); // 
        this.isLogged = false; //состояение авторизации делаем false
      }
    })
  }

  //-------------------------------------------Метод для создания нового пользователя----------------------------------------------------------
  onSignUp(email, password) {
    return this.afAuth.createUserWithEmailAndPassword(email, password) //возвращаеам Promise создания нового пользователя
      .then((result) => { //результат создания нового пользователя
        let localUser: User = { //создаем локально в функции пользователя, присваивая ему все необходимые свойства
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          emailVerified: result.user.emailVerified,
          account_type: 'student' //по умолчанию присваиваем тип аккаунта student
        }
        localStorage.setItem('user', JSON.stringify(localUser)); //сохраняем локально на устройстве данные
        this.SetUserData(localUser); //отправляем данные в БД

      }).catch((error) => {
        window.alert(error.message); //в случае ошибки отправляем error в alert
      })
  }

  //-------------------------------------------Метод для авторизации существующего пользователя-------------------------------------------------
  onSignIn(email, password) {
    return this.afAuth.signInWithEmailAndPassword(email, password) //возвращаеам Promise авторизации
      .then((result) => { //по результату ищем по uid данные в бд на пользователя
        this.afs.collection('users').doc(`${result.user.uid}`).get().toPromise() //еще один Promise, запрос в бд
          .then(doc => { //получив документ
            if (!doc.exists) {
              console.log('No such document!'); //проверяем его наличие
            } else {
              this.userDBdata = doc.data(); //присваиваем данные
              this.userDBdata.emailVerified = result.user.emailVerified; //присваиваем стату верификации email
              localStorage.setItem('userDB', JSON.stringify(this.userDBdata)); //сохраняем локально данные БД
              this.SetUserData(this.userDBdata); //Отправляем новые данные в БД
              this.isLogged = true; //Статус аутентификации ставим на true
            }
          })

        this.ngZone.run(() => {
          this.router.navigate(['/profile']);//Перенаправляемся на профиль
        });

      }).catch((error) => {
        window.alert(error.message) //В случае ошибки показываем alert
      })
  }

  //-------------------------------------------Метод для отправки данных в БД-------------------------------------------------
  SetUserData(user) {
    const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${user.uid}`); // присваиваем ссылку на документ юзера
    const userData: User = { //создаем локально в функции пользователя, присваивая все необходимые данные
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
      account_type: user.account_type
    }

    return userRef.set(userData, { merge: true }); //отправляем данные в бд, устанавливая свойство merge => true
                                                   //что позволяет затрагивать только указанные данные, и не изменять другие данные
  }

  //-------------------------------------------Метод для отправки данных в БД-------------------------------------------------
  SignOut() {
    return this.afAuth.signOut().then(() => { //производим выход из системы
      localStorage.removeItem('user');   //Удаляем локальные данные с устройства
      localStorage.removeItem('userDB'); //
      this.isLogged = false; //Состояние авторизации false
      this.router.navigate(['']); //выкидываем пользователя на гланый экран
    })
  }
}
