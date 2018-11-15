import { Subscription, Observable } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { MoviesService } from '../movies.service';
import { Movie } from '../models/movies.model';
import { Store } from '@ngrx/store';

import {
  trigger,
  group,
  state,
  style,
  transition,
  animate,
  keyframes,
  query,
  stagger
} from '@angular/animations';

import * as moviesReducer from '../reducers/movies.reducer';
import * as Movies from '../actions/movies.actions';

@Component({
  selector: 'app-movies',
  templateUrl: './movies.component.html',
  styleUrls: ['./movies.component.scss'],
  animations: [
    trigger('cardAnimation', [
      transition('* <=> *', [
        query(
          ':enter',
          [
            style({ opacity: 0, transform: 'translateY(-15px)' }),
            stagger(
              '100ms',
              animate(
                '550ms ease-out',
                style({ opacity: 1, transform: 'translateY(0px)' })
              )
            )
          ],
          { optional: true }
        ),
        query(':leave', animate('100ms', style({ opacity: 0 })), {
          optional: true
        })
      ])
    ])
  ]
})
export class MoviesComponent implements OnInit {
  movie$: Observable<Movie[]>;
  upComingMovies$: Observable<boolean>;

  constructor(
    private movieService: MoviesService,
    private moviesStore: Store<moviesReducer.State>
  ) {}

  ngOnInit() {
    this.upComingMovies$ = this.moviesStore.select(
      moviesReducer.isUpComingMovies
    );
    this.movie$ = this.moviesStore.select(moviesReducer.getUpComingMovies);
    this.getMovies();
  }

  getMovies() {
    this.movieService.getMovies();
  }
}
