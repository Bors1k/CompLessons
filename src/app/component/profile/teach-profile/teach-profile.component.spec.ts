// import { async, ComponentFixture, TestBed } from '@angular/core/testing';
// import { AngularFireAuthModule } from '@angular/fire/auth';
// import { environment } from '../../../../environments/environment';
// import { AngularFireModule  } from '@angular/fire';
// import { AngularFireStorageModule } from '@angular/fire/storage'
// import { TeachProfileComponent } from './teach-profile.component';
// import { RouterModule } from '@angular/router';
// import { LoginComponent } from '../../login/login.component';

// describe('TeachProfileComponent', () => {
//   let component: TeachProfileComponent;
//   let fixture: ComponentFixture<TeachProfileComponent>;

//   beforeEach(async(() => {
//     TestBed.configureTestingModule({
//       declarations: [ TeachProfileComponent ],
//       imports: [RouterModule.forRoot([{path: 'teach-profile', component: TeachProfileComponent},
//         {path: 'login', component: LoginComponent}]),
//         AngularFireModule.initializeApp(environment.firebaseConfig),
//         AngularFireAuthModule,
//         AngularFireStorageModule]
//     })
//       .compileComponents();
//   }));

//   beforeEach(() => {
//     fixture = TestBed.createComponent(TeachProfileComponent);
//     component = fixture.componentInstance;
//     fixture.detectChanges();

//   });

//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });

//   it('should get teacher`s courses', async () => {
//     let GetCourses: boolean;
//     await component.GetMyCourses().then(result => {
//       GetCourses = result;
//     })
//     await expect(GetCourses).toBe(true);
//   });

//   it('should update teach-profile info with wrong id = false', async ()=>{
//     let UpdateProfile: boolean;
//     await component.UpdateProfile('name','surename','0').then(result=>{
//       UpdateProfile = result;
//     })
//     await expect(UpdateProfile).toBe(false);
//   });

//   it('should update teach-profile info with true id = true', async ()=>{
//     let UpdateProfile: boolean;
//     await component.UpdateProfile('Аркадий','Паровозов','7b80yHZj3mOntigp25cXRViuRJB3').then(result=>{
//       UpdateProfile = result;
//     })
//     await expect(UpdateProfile).toBe(true);
//   });
// });
