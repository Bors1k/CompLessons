import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Courses, subCourses } from '../../interfaces/courses';
import { Router } from '@angular/router';

@Component({
  selector: 'app-courses',
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.scss']
})
export class CoursesComponent{

  public coursesCollection: Courses[] = [];
  public subcourses: subCourses[] = [];
  public showSpinner: boolean = true;

  constructor(public afs: AngularFirestore,public router: Router) { 
    this.LoadingCoursesData();
  }

  MoveToCourse(group: string, id: string){
    console.log("Course id => " + id, "  GroupId => " + group);
    this.router.navigate([`courses/${group}/${id}`]);  //переходим к компоненту AboutCourses, передавая ГруппуКусов и id курса в качестве параметров
  }
  async LoadingCoursesData(){ //Функция для получения данных о курсах из БД
    await this.afs.collection("courses").get().toPromise()
    .then(snapshot => {
      snapshot.forEach(async doc => { //получаем сначала документа ГруппыКусов, содержащей подкурсы

        await this.afs.collection(`courses/${doc.id}/courses`).get().toPromise().then( //получаем подкурсы по id ГруппыКурсов
          snapshot=>{
            snapshot.forEach(subDoc=>{              
              this.subcourses.push({ //пушим все подкурсы в массив
                id: subDoc.id,
                name: subDoc.data().name,
                description: subDoc.data().description,
                index_url: subDoc.data().index_url
              })
            })
          }
        )

        this.coursesCollection.push({ //id, название ГруппыКурсов, и массив подкурсов в один общий массив
          id: doc.id,
          name: doc.data().name,
          subCourses: this.subcourses
        })
        this.subcourses = []; // очищаем массив подкурсов для следующей ГруппыКурсов
      });
    })
    .catch(err => {
      console.log('Error getting documents', err);
    });
    this.showSpinner = false;
  }
}
