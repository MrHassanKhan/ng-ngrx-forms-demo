import { map } from 'rxjs/operators';
import { Injectable, Inject } from '@angular/core';
import { Status, ToDo } from './todo.model';
import { AngularFirestore } from 'angularfire2/firestore';
import { Subject, Subscription } from 'rxjs';
import * as UI from '../shared/store/ui.actions';
import * as appReducer from '../app.reducer';
import { Store } from '@ngrx/store';
import { UIControlService } from '../shared/uicontrol.service';

@Injectable()
export class ToDoService {
  todoStatus: Status[];
  todo: ToDo[];
  todoStatusChanged = new Subject<Status[]>();
  todosChanged = new Subject<ToDo[]>();

  constructor(
    private todoDb: AngularFirestore,
    private uiControlService: UIControlService,
    private store: Store<appReducer.State>
  ) {}

  fbSubs: Subscription[] = [];

  getToDoStatus() {
    this.store.dispatch(new UI.StartLoading());
    this.fbSubs.push(
      this.todoDb
        .collection('Status')
        .snapshotChanges()
        .pipe(
          map(resData => {
            return resData.map(data => {
              return {
                id: data.payload.doc.id,
                status: data.payload.doc.get('status')
              };
            });
          })
        )
        .subscribe(
          (todoStatus: Status[]) => {
            this.store.dispatch(new UI.StartLoading());
            this.todoStatus = todoStatus;
            this.todoStatusChanged.next([...this.todoStatus]);
          },
          error => {
            this.todoStatusChanged.next(null);
            this.store.dispatch(new UI.StopLoading());
            this.uiControlService.showMessage(
              'Error fetching ToDo Status, please try again',
              null,
              3000
            );
          }
        )
    );
  }

  getToDos() {
    this.store.dispatch(new UI.StartLoading());
    this.fbSubs.push(
      this.todoDb
        .collection('ToDo')
        .snapshotChanges()
        .pipe(
          map(resData => {
            return resData.map(res => {
              const data = res.payload.doc.data() as ToDo;
              data.id = res.payload.doc.id;
              return data;
            });
          })
        )
        .subscribe(
          (todo: ToDo[]) => {
            this.store.dispatch(new UI.StopLoading());
            this.todo = todo;
            this.todosChanged.next([...this.todo]);
          },
          error => {
            this.todosChanged.next(null);
            this.store.dispatch(new UI.StopLoading());
            this.uiControlService.showMessage(
              'Error fetching ToDos, please try again',
              null,
              3000
            );
          }
        )
    );
  }

  cancelFBSubscriptions() {
    this.fbSubs.forEach(subs => subs.unsubscribe());
  }

  addToDoToDatabase(todo: ToDo) {
    this.todoDb.collection('ToDo').add(todo);
  }
}
