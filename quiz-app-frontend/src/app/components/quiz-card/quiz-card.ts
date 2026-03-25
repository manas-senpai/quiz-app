import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-quiz-card',
  imports: [],
  templateUrl: './quiz-card.html',
  styles: ``,
})
export class QuizCard {

  readonly question = input<any>();

  nextQuestion = output();
  endQuiz = output();
}
