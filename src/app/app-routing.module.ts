import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from '../app/component/login/login.component'
import { RegisterComponent } from './component/register/register.component';
import { VerifyEmailComponent } from './component/verify-email/verify-email.component';
import { ProfileComponent } from './component/profile/profile.component';
import { CoursesComponent } from './component/courses/courses.component';
import { AboutCourseComponent } from './component/courses/about-course/about-course.component';
import { StartComponent } from './component/start/start.component';
import { TeachProfileComponent } from './component/profile/teach-profile/teach-profile.component';


const routes: Routes = [
  { path: '', component: StartComponent},
  { path: 'login', component: LoginComponent},
  { path: 'register', component: RegisterComponent},
  { path: 'verify-email', component: VerifyEmailComponent},
  { path: 'profile', component: ProfileComponent},
  { path: 'teach-profile', component: TeachProfileComponent},
  { path: 'courses', component: CoursesComponent},
  { path: 'courses/:group/:id', component: AboutCourseComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {

}
