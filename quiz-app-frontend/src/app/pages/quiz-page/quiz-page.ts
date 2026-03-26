import { Component, OnDestroy, signal } from '@angular/core';
import { Router } from '@angular/router';
import { QuizCard } from '../../components/quiz-card/quiz-card';

@Component({
  selector: 'app-quiz-page',
  imports: [QuizCard],
  templateUrl: './quiz-page.html',
  styles: ``,
})
export class QuizPage implements OnDestroy {
  currentQuestionIndex = signal(0);
  timeLeft = signal(60);
  private timerId: ReturnType<typeof setInterval> | null = null;

  constructor(private router: Router) {
    this.startTimer();
  }

  sample = {
    "questions": [
      {
        "question": "Which language runs in the browser?",
        "options": ["Java", "C", "Python", "JavaScript"],
        "answer": "JavaScript"
      },
      {
        "question": "What does CSS stand for?",
        "options": ["Central Style Sheets", "Cascading Style Sheets", "Cascading Simple Sheets", "Cars SUVs Sailboats"],
        "answer": "Cascading Style Sheets"
      },
      {
        "question": "What does HTML stand for?",
        "options": ["Hypertext Markup Language", "Hypertext Markdown Language", "Hyperloop Machine Language", "Helicopters Terminals Motorboats Lamborginis"],
        "answer": "Hypertext Markup Language"
      },
      {
        "question": "What year was JavaScript launched?",
        "options": ["1996", "1995", "1994", "none of the above"],
        "answer": "1995"
      },
      {
        "question": "What does SQL stand for?",
        "options": ["Stylish Question Language", "Stylesheet Query Language", "Statement Question Language", "Structured Query Language"],
        "answer": "Structured Query Language"
      }
    ]
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
    if (this.currentQuestionIndex() < this.sample.questions.length - 1) {
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

