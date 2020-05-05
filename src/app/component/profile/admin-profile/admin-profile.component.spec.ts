import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { environment } from '../../../../environments/environment';
import { AngularFireModule  } from '@angular/fire';
import { AngularFireStorageModule } from '@angular/fire/storage'
import { AdminProfileComponent } from './admin-profile.component';
import { RouterModule } from '@angular/router';
import { LoginComponent } from '../../login/login.component';

describe('AdminProfileComponent', () => {
  let component: AdminProfileComponent;
  let fixture: ComponentFixture<AdminProfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminProfileComponent ],
      imports: [RouterModule.forRoot([{path: 'admin-profile', component: AdminProfileComponent},
        {path: 'login', component: LoginComponent}]),
        AngularFireModule.initializeApp(environment.firebaseConfig),
        AngularFireAuthModule,
        AngularFireStorageModule]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get users list', async () => {
    let GetCourses: boolean;
    await component.GetUsersList().then(result => {
      GetCourses = result;
    })
    await expect(GetCourses).toBe(true);
  });

  it('should update admin-profile info with wrong id = false', async ()=>{
    let UpdateProfile: boolean;
    await component.UpdateProfile('name','surename','0').then(result=>{
      UpdateProfile = result;
    })
    await expect(UpdateProfile).toBe(false);
  });

  it('should update admin-profile info with true id = true', async ()=>{
    let UpdateProfile: boolean;
    await component.UpdateProfile('Admin','Adminovich','ABD1RoqM8WgZDPPoSYcAe2Y3JD93').then(result=>{
      UpdateProfile = result;
    })
    await expect(UpdateProfile).toBe(true);
  });
});
