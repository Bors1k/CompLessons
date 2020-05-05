// import { async, ComponentFixture, TestBed } from '@angular/core/testing';
// import { AngularFireAuthModule } from '@angular/fire/auth';
// import { environment } from '../../../environments/environment';
// import { AngularFireModule  } from '@angular/fire';
// import { AngularFireStorageModule } from '@angular/fire/storage'
// import { ProfileComponent } from './profile.component';
// import { RouterModule } from '@angular/router';
// import { AuthService } from 'src/app/services/auth/auth.service';
// import { LoginComponent } from '../login/login.component';
//
// describe('ProfileComponent', () => {
//   let component: ProfileComponent;
//   let fixture: ComponentFixture<ProfileComponent>;
//
//   //let spy: jasmine.Spy;
//
//   beforeEach(async(() => {
//     TestBed.configureTestingModule({
//       declarations: [ ProfileComponent ],
//       imports: [RouterModule.forRoot([{path: 'profile', component: ProfileComponent},
//                                       {path: 'login', component: LoginComponent}]),
//       AngularFireModule.initializeApp(environment.firebaseConfig),
//       AngularFireAuthModule,
//       AngularFireStorageModule]
//     })
//     .compileComponents();
//   }));
//
//   beforeEach(() => {
//     fixture = TestBed.createComponent(ProfileComponent);
//     component = fixture.componentInstance;
//     fixture.detectChanges();
//
//   });
//
//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });
//
//   it('should get my courses', async () => {
//     let GetCourses: boolean;
//     await component.GetMyCourses().then(result => {
//       GetCourses = result;
//     })
//     await expect(GetCourses).toBe(true);
//   });
//
//   it('should update profile info with wrong id = false', async ()=>{
//     let UpdateProfile: boolean;
//     await component.UpdateProfile('name','surename','0').then(result=>{
//       UpdateProfile = result;
//     })
//     await expect(UpdateProfile).toBe(false);
//   });
//
//   it('should update profile info with true id = true', async ()=>{
//     let UpdateProfile: boolean;
//     await component.UpdateProfile('name','surename','xPKMg7kDGzfAon5SaZRyPToXxcj2').then(result=>{
//       UpdateProfile = result;
//     })
//     await expect(UpdateProfile).toBe(true);
//   });
// });
