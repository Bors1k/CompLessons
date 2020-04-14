import { Injectable, NgZone } from '@angular/core';
import { AngularFireAuth } from "@angular/fire/auth";
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Router } from '@angular/router';

import * as firebase from 'firebase/app';
import "@angular/fire/storage";
import { User } from 'src/app/interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  userData: any;
  userDBdata: any;
  timeout: number = 5;  
  isLogged: boolean = false;

  constructor(
    public afs: AngularFirestore,   // Inject Firestore service
    public afAuth: AngularFireAuth, // Inject Firebase auth service
    public router: Router,  
    public ngZone: NgZone // NgZone service to remove outside scope warning
  ) {
    
    this.afAuth.authState.subscribe(user=>{
      if(user){
        if(this.router.routerState.snapshot.url == "/"){
          this.router.navigate(["/profile"]);
        }
        this.userData = user;
        localStorage.setItem('user',JSON.stringify(this.userData));
        JSON.parse(localStorage.getItem('user'));
        this.isLogged = true;
      }
      else{
        localStorage.setItem('user',null);
        JSON.parse(localStorage.getItem('user'));
        this.isLogged = false;
      }
    })

   }

   onSignUp(email, password){
    return this.afAuth.createUserWithEmailAndPassword(email,password)
    .then((result)=>{
      let localUser: User = {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        emailVerified: result.user.emailVerified
      }

      this.SetUserData(localUser);

      // this.SendVerificationMail();

      setTimeout(() => {
        this.onSignIn(email, password);
      }, 5000);

    }).catch((error)=>{
      window.alert(error.message);
    })
  }

  onSignIn(email, password) {
    console.log("try login")
    return this.afAuth.signInWithEmailAndPassword(email, password)
      .then((result) => {
        console.log(result);
        this.ngZone.run(() => {
          this.router.navigate(['/profile']);
        });

        this.afs.collection('users').doc(`${result.user.uid}`).get().toPromise()
        .then(doc=>{
          if (!doc.exists) {
            console.log('No such document!');
          } else {
            this.userDBdata = doc.data();
            this.userDBdata.emailVerified = result.user.emailVerified;
            this.SetUserData(this.userDBdata);
            this.isLogged = true;
          }
        })
         
      }).catch((error) => {
        window.alert(error.message)
      })
  }

  // SendVerificationMail(){
  //   return this.afAuth.auth.currentUser.sendEmailVerification()
  //   .then(() => {
  //     this.isLogged = false;
  //     this.router.navigate(['/veryf-email']);
  //   })
  // }
  
  SetUserData(user){
    const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${user.uid}`);
    const userData: User = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified
    }
    
    return userRef.set(userData, {
      merge: true
    })
  }

  SignOut() {
    return this.afAuth.signOut().then(() => {
      localStorage.removeItem('user');
      this.isLogged = false;
      this.router.navigate(['']);
    })
  }
}
