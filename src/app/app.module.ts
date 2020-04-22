import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './component/login/login.component';
import { RegisterComponent } from './component/register/register.component';
import { ProfileComponent } from './component/profile/profile.component';
import { CoursesComponent } from './component/courses/courses.component';

import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireModule  } from '@angular/fire';
import { AngularFireStorageModule } from '@angular/fire/storage'
import { environment } from '../environments/environment';
import { AboutCourseComponent } from './component/courses/about-course/about-course.component';
import { StartComponent } from './component/start/start.component';
import { TeachProfileComponent } from './component/profile/teach-profile/teach-profile.component';
import { AdminProfileComponent } from './component/profile/admin-profile/admin-profile.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    ProfileComponent,
    CoursesComponent,
    AboutCourseComponent,
    StartComponent,
    TeachProfileComponent,
    AdminProfileComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireAuthModule,
    AngularFireStorageModule,
    AngularFirestoreModule,
    CommonModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
