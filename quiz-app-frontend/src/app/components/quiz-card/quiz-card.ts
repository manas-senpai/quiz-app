import { Component, input, output } from '@angular/core';

export type QuizQuestion = {
  question: string;
  options: string[];
  answer: string;
};

export type AnswerSelection = {
  selectedOption: string;
  correctAnswer: string;
  isCorrect: boolean;
};

@Component({
  selector: 'app-quiz-card',
  imports: [],
  templateUrl: './quiz-card.html',
  styles: ``,
})
export class QuizCard {
  readonly question = input.required<QuizQuestion>();
  readonly selectedOption = input<string | null>(null);

  readonly answerSelected = output<AnswerSelection>();
  readonly nextQuestion = output();
  readonly endQuiz = output();

  chooseOption(option: string) {
    if (this.selectedOption()) {
      return;
    }

    const correctAnswer = this.question().answer;

    this.answerSelected.emit({
      selectedOption: option,
      correctAnswer,
      isCorrect: option === correctAnswer,
    });
  }

  isAnswered() {
    return this.selectedOption() !== null;
  }

  isCorrectOption(option: string) {
    return this.isAnswered() && option === this.question().answer;
  }

  isWrongSelection(option: string) {
    return this.selectedOption() === option && option !== this.question().answer;
  }
}
