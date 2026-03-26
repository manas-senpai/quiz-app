import { Component } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar'; 
import { Router } from '@angular/router';
@Component({
  selector: 'app-result-page',
  imports: [MatProgressBarModule],
  templateUrl: './result-page.html',
  styles: ``,
})
export class ResultPage {

  constructor(private router: Router) { }

  retry() {
    this.router.navigate(['/quiz']);
  }

  home() {
    this.router.navigate(['/']);
  }

}
