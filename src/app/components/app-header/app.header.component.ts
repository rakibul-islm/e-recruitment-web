import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/security/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './app.header.component.html'
})
export class AppHeaderComponent implements OnInit {
  isAuthenticated: boolean = false;

  constructor(
    private authService: AuthService, 
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.isLoggedIn().subscribe(authenticated => {
      this.isAuthenticated = authenticated;
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}