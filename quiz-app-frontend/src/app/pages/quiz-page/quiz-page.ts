import { Component, OnDestroy, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AnswerSelection, QuizCard, QuizQuestion } from '../../components/quiz-card/quiz-card';

type QuizData = {
  questions: QuizQuestion[];
};

type AnswerSummary = {
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
  answers: AnswerSummary[];
};

@Component({
  selector: 'app-quiz-page',
  imports: [QuizCard],
  templateUrl: './quiz-page.html',
  styles: ``,
})
export class QuizPage implements OnDestroy {
  currentQuestionIndex = signal(0);
  quizData = signal<QuizData>(this.loadQuiz());
  timeLeft = signal(0);
  selectedAnswers = signal<Record<number, AnswerSummary>>({});
  private readonly secondsPerQuestion = 10;
  private timerId: ReturnType<typeof setInterval> | null = null;

  constructor(private router: Router) {
    this.timeLeft.set(this.quizData().questions.length * this.secondsPerQuestion);
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
        this.end(true);
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

  recordAnswer(selection: AnswerSelection) {
    const index = this.currentQuestionIndex();

    if (this.selectedAnswers()[index]) {
      return;
    }

    const currentQuestion = this.quizData().questions[index];

    this.selectedAnswers.update((answers) => ({
      ...answers,
      [index]: {
        question: currentQuestion.question,
        selectedOption: selection.selectedOption,
        correctAnswer: selection.correctAnswer,
        isCorrect: selection.isCorrect,
      },
    }));
  }

  currentSelectedOption() {
    return this.selectedAnswers()[this.currentQuestionIndex()]?.selectedOption ?? null;
  }

  correctCount() {
    return Object.values(this.selectedAnswers()).filter((answer) => answer.isCorrect).length;
  }

  next() {
    if (!this.currentSelectedOption()) {
      return;
    }

    if (this.currentQuestionIndex() < this.quizData().questions.length - 1) {
      this.currentQuestionIndex.set(this.currentQuestionIndex() + 1);
      return;
    }

    this.end();
  }

  end(timedOut = false) {
    this.stopTimer();

    const result = this.buildResultSummary(timedOut);

    if (typeof window !== 'undefined') {
      window.localStorage.setItem('quizResult', JSON.stringify(result));
    }

    this.router.navigate(['/result'], { state: { result } });
  }

  private buildResultSummary(timedOut: boolean): QuizResult {
    const answers = this.quizData().questions.map((question, index) => {
      const savedAnswer = this.selectedAnswers()[index];

      return {
        question: question.question,
        selectedOption: savedAnswer?.selectedOption ?? 'Not answered',
        correctAnswer: question.answer,
        isCorrect: savedAnswer?.isCorrect ?? false,
      };
    });

    const correctAnswers = answers.filter((answer) => answer.isCorrect).length;
    const totalQuestions = answers.length;

    return {
      totalQuestions,
      correctAnswers,
      wrongAnswers: totalQuestions - correctAnswers,
      percentage: totalQuestions ? Math.round((correctAnswers / totalQuestions) * 100) : 0,
      timedOut,
      answers,
    };
  }

  ngOnDestroy() {
    this.stopTimer();
  }
}
