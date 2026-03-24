import { Routes } from '@angular/router';
import { HomePage } from './pages/home-page/home-page';
import { QuizPage } from './pages/quiz-page/quiz-page';
import { ResultPage } from './pages/result-page/result-page';
import { PageNotFound } from './pages/page-not-found/page-not-found';


export const routes: Routes = [
  { path: '', component: HomePage , pathMatch: 'full' },
  { path: 'quiz', component: QuizPage },
  { path: 'result', component: ResultPage },
  { path: '**', component: PageNotFound }
];
