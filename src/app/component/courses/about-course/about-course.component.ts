import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-about-course',
  templateUrl: './about-course.component.html',
  styleUrls: ['./about-course.component.scss']
})
export class AboutCourseComponent implements AfterViewInit  {

  @ViewChild('frame') frameCont: ElementRef;

  id: string;
  group: string;
  private routeSubscription: Subscription;
  index_url: string;
  showSpinner: boolean = true;

  constructor(private route: ActivatedRoute,public afs: AngularFirestore)  {
    this.routeSubscription = route.params.subscribe(params=>{this.id=params['id'];this.group=params["group"]});
  }

  async ngAfterViewInit(){
    console.log(this.frameCont);
    await this.LoadPageFromStorage();
    await (()=>{this.frameCont.nativeElement.innerHTML = `<iframe style="margin-top: 10px; height: 80vh; width: 100%;" *ngIf="!showSpinner" src='${this.index_url}' frameborder="0"></iframe>`})();
    this.showSpinner = false;
  }

  async LoadPageFromStorage(){

    await this.afs.doc(`courses/${this.group}/courses/${this.id}`).get().toPromise()
    .then(doc=>{
        if(!doc.exists){
          console.log('Нет такого доумента')
        }
        else {
          this.index_url = doc.data().index_url;
        }
      }).catch(err=>{
        console.error("Ошибка получения документа ", err);
      })
    }
  SubOnCourse(){
    console.log("Подписываемся на курс с id => " + this.id);
  }
}
