import { Component, OnDestroy, signal } from '@angular/core';
import { Router } from '@angular/router';
import { QuizCard } from '../../components/quiz-card/quiz-card';

type QuizQuestion = {
  question: string;
  options: string[];
  answer: string;
};

type QuizData = {
  questions: QuizQuestion[];
};

@Component({
  selector: 'app-quiz-page',
  imports: [QuizCard],
  templateUrl: './quiz-page.html',
  styles: ``,
})
export class QuizPage implements OnDestroy {
  currentQuestionIndex = signal(0);
  timeLeft = signal(60);
  quizData = signal<QuizData>(this.loadQuiz());
  private timerId: ReturnType<typeof setInterval> | null = null;

  constructor(private router: Router) {
    this.startTimer();
  }

  private loadQuiz(): QuizData {
    if (typeof window !== 'undefined') {
      const stateQuiz = window.history.state?.quiz as QuizData | undefined;

      if (stateQuiz?.questions?.length) {
        return stateQuiz;
      }

      const storedQuiz = window.localStorage.getItem('generatedQuiz');
      if (storedQuiz) {
        try {
          const parsedQuiz = JSON.parse(storedQuiz) as QuizData;
          if (parsedQuiz.questions?.length) {
            return parsedQuiz;
          }
        } catch (error) {
          console.error('Failed to read saved quiz data:', error);
        }
      }
    }

    return {
      questions: [
        {
          question: 'Which language runs in the browser?',
          options: ['Java', 'C', 'Python', 'JavaScript'],
          answer: 'JavaScript',
        },
      ],
    };
  }

  private startTimer() {
    this.timerId = setInterval(() => {
      if (this.timeLeft() <= 1) {
        this.stopTimer();
        this.timeLeft.set(0);
        this.end();
      } else {
        this.timeLeft.set(this.timeLeft() - 1);
      }
    }, 1000);
  }

  private stopTimer() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  next() {
    if (this.currentQuestionIndex() < this.quizData().questions.length - 1) {
      this.currentQuestionIndex.set(this.currentQuestionIndex() + 1);
    }
  }

  end() {
    this.stopTimer();
    this.router.navigate(['/result']);
  }

  ngOnDestroy() {
    this.stopTimer();
  }
}
