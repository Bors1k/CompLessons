import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  //-----------------------------------------------------------------------------------------------------------------------------------------
  //-----------------------------------------------Методы для работы с формой регистрации----------------------------------------------------
  //их тут нет, т.к. все методы прописаны в сервисе аутентификации(вызываются в html документе), который инжектится в конструкторе.

  constructor(public authService: AuthService  //сервис для аутентификации
    ) { }
  
  //-----------------------------------------------Вызывается при инициализации компонента register-------------------------------------------
  ngOnInit(): void { 
    if(this.authService.isLogged){ //если пользователь авторизован 
      this.authService.router.navigate(['/profile']); //перекинуть его на профиль
    }
  }

}
