import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from '../../../services/app.service';

@Component({
  selector: 'app-left-sidebar',
  templateUrl: './left-sidebar.component.html',
  styleUrls: ['./left-sidebar.component.scss'],
})
export class LeftSidebarComponent implements OnInit {

  @Input() navItems = [];
  idemGuard = Date.now();
  constructor(
    public app: AppService,
    public router: Router,
  ) { }

  ngOnInit() { }

  endHere(e) { e.stopPropagation(); }
}
