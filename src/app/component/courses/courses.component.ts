import { Component } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Courses, subCourses } from '../../interfaces/courses';

@Component({
  selector: 'app-courses',
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.scss']
})
export class CoursesComponent{

  public coursesCollection: Courses[] = [];
  public subcourses: subCourses[] = [];
  public showSpinner: boolean = true;

  constructor(public afs: AngularFirestore) { 
    this.LoadingCoursesData();
  }

  MoveToCourse(id: string){
    alert("Course id => " + id);
  }
  async LoadingCoursesData(){ //Функция для получения данных о курсах из БД
    await this.afs.collection("courses").get().toPromise()
    .then(snapshot => {
      snapshot.forEach(async doc => { //получаем сначала документа ГруппыКусов, содержащей подкурсы

        await this.afs.collection(`courses/${doc.id}/courses`).get().toPromise().then( //получаем подкурсы по id ГруппыКурсов
          snapshot=>{
            snapshot.forEach(subDoc=>{              
              this.subcourses.push({
                id: subDoc.id,
                name: subDoc.data().name,
                description: subDoc.data().description,
                index_url: subDoc.data().index_url
              })
            })
          }
        )

        this.coursesCollection.push({
          id: doc.id,
          name: doc.data().name,
          subCourses: this.subcourses
        })
        this.subcourses = [];
      });
    })
    .catch(err => {
      console.log('Error getting documents', err);
    });
    this.showSpinner = false;
  }
}
