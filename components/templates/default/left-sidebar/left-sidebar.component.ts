/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Components } from '../../../../../ui.components';
import { AppService } from '../../../services/app.service';

@Component({
  selector: 'app-left-sidebar',
  templateUrl: './left-sidebar.component.html',
  styleUrls: ['./left-sidebar.component.scss'],
})
export class LeftSidebarComponent implements OnInit {
  static registration = Components.register(LeftSidebarComponent, () => require('./left-sidebar.component.json'));

  @Input() navItems = [];
  idemGuard = Date.now();
  constructor(
    public app: AppService,
    public router: Router,
  ) { }

  ngOnInit() { }

  endHere(e) { e.stopPropagation(); }
}
