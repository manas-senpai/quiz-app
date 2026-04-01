import { Component, signal } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Router } from '@angular/router';

type ResultAnswer = {
  question: string;
  selectedOption: string;
  correctAnswer: string;
  isCorrect: boolean;
};

type QuizResult = {
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  percentage: number;
  timedOut: boolean;
  answers: ResultAnswer[];
};

@Component({
  selector: 'app-result-page',
  imports: [MatProgressBarModule],
  templateUrl: './result-page.html',
  styles: ``,
})
export class ResultPage {
  readonly result = signal<QuizResult>(this.loadResult());

  constructor(private router: Router) { }

  private loadResult(): QuizResult {
    if (typeof window !== 'undefined') {
      const stateResult = window.history.state?.result as QuizResult | undefined;

      if (stateResult?.totalQuestions) {
        return stateResult;
      }

      const storedResult = window.localStorage.getItem('quizResult');
      if (storedResult) {
        try {
          const parsedResult = JSON.parse(storedResult) as QuizResult;
          if (parsedResult.totalQuestions) {
            return parsedResult;
          }
        } catch (error) {
          console.error('Failed to read saved result data:', error);
        }
      }
    }

    return {
      totalQuestions: 1,
      correctAnswers: 0,
      wrongAnswers: 1,
      percentage: 0,
      timedOut: false,
      answers: [],
    };
  }

  headline() {
    const percentage = this.result().percentage;

    if (percentage === 100) {
      return 'Perfect score!';
    }

    if (percentage >= 70) {
      return 'Nice work!';
    }

    if (percentage >= 40) {
      return 'Good try!';
    }

    return 'Keep practicing!';
  }

  summaryText() {
    if (this.result().timedOut) {
      return 'Time ran out, but your progress was still saved.';
    }

    return 'Your quiz summary is ready with the final score and answer recap.';
  }

  retry() {
    this.router.navigate(['/quiz']);
  }

  home() {
    this.router.navigate(['/']);
  }
}
