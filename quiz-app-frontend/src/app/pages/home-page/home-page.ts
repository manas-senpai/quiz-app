import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

type GeneratedQuizResponse = {
  questions?: Array<{
    question: string;
    options: string[];
    answer: string;
  }>;
  error?: string;
};

@Component({
  selector: 'app-home-page',
  imports: [ReactiveFormsModule],
  templateUrl: './home-page.html',
  styles: `
    .loader {
      border: 4px solid #f3f3f3;
      border-top: 4px solid #3498db;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 2s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `,
})
export class HomePage {
  private readonly apiUrl = '/generate';

  isLoading = signal(false);
  errorMessage = signal('');

  name = new FormControl('');
  queNo = new FormControl('5');

  constructor(private router: Router) { }

  async onGenerateQuiz() {
    const topic = this.name.value?.trim() ?? '';
    const questionCount = Number(this.queNo.value);

    if (!topic || !Number.isInteger(questionCount) || questionCount <= 0) {
      this.errorMessage.set('Enter a topic and a valid number of questions.');
      return;
    }

    this.errorMessage.set('');
    this.isLoading.set(true);

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          queNo: questionCount,
        }),
      });

      const result = (await response.json()) as { generatedText?: string; error?: string };

      if (!response.ok) {
        throw new Error(result.error || 'Unable to generate quiz right now.');
      }

      const quizData: GeneratedQuizResponse = result.generatedText
        ? JSON.parse(result.generatedText)
        : result;

      if (quizData.error) {
        throw new Error(quizData.error);
      }

      if (!quizData.questions?.length) {
        throw new Error('No quiz questions were returned from the backend.');
      }

      localStorage.setItem('generatedQuiz', JSON.stringify(quizData));
      await this.router.navigate(['/quiz'], { state: { quiz: quizData } });
    } catch (error) {
      console.error('Quiz generation failed:', error);
      this.errorMessage.set(
        error instanceof Error ? error.message : 'Something went wrong while generating the quiz.',
      );
    } finally {
      this.isLoading.set(false);
    }
  }
}
