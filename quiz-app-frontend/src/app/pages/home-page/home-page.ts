import { Component, signal } from '@angular/core';
import { FormControl ,ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';



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

  isLoading = signal(false);

  name = new FormControl('');
  queNo = new FormControl('');

  constructor(private router: Router) { }

  onGenerateQuiz() {

    alert(this.name.value + ' ' + this.queNo.value);
    this.isLoading.set(true);
    // Simulate quiz generation delay
    setTimeout(() => {
      this.isLoading.set(false);
      this.router.navigate(['/quiz']);
    }, 2000);
  }
}
