import { Component } from '@angular/core';
import { LoadingService } from './services/utility/loading.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'e-recruitment';

  constructor(public loadingService: LoadingService) {}
}
