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

  userData: any;
  userDBdata: any;
  timeout: number = 5;
  isLogged: boolean = false;

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
    return this.afAuth.createUserWithEmailAndPassword(email, password)
      .then((result) => {
        let localUser: User = {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          emailVerified: result.user.emailVerified,
          account_type: 'student'
        }
        localStorage.setItem('user', JSON.stringify(localUser));
        this.SetUserData(localUser);

      }).catch((error) => {
        window.alert(error.message); //в случае ошибки отправляем error
      })
  }

  //-------------------------------------------Метод для авторизации существующего пользователя-------------------------------------------------
  onSignIn(email, password) {
    return this.afAuth.signInWithEmailAndPassword(email, password)
      .then((result) => {
        this.afs.collection('users').doc(`${result.user.uid}`).get().toPromise()
          .then(doc => {
            if (!doc.exists) {
              console.log('No such document!');
            } else {
              console.log(doc.data());
              this.userDBdata = doc.data();
              this.userDBdata.emailVerified = result.user.emailVerified;
              localStorage.setItem('userDB', JSON.stringify(this.userDBdata));
              this.SetUserData(this.userDBdata);
              this.isLogged = true;
            }
          })

        this.ngZone.run(() => {
          this.router.navigate(['/profile']);
        });

      }).catch((error) => {
        window.alert(error.message)
      })
  }


  SetUserData(user) {
    const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${user.uid}`);
    const userData: User = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
      account_type: user.account_type
    }

    return userRef.set(userData, { merge: true });
  }

  SignOut() {
    return this.afAuth.signOut().then(() => {
      localStorage.removeItem('user');
      this.isLogged = false;
      this.router.navigate(['']);
    })
  }
}
