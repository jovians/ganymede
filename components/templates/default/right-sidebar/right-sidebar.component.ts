/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { Component, OnInit } from '@angular/core';
import { Components } from '../../../../../ui.components';

@Component({
  selector: 'app-right-sidebar',
  templateUrl: './right-sidebar.component.html',
  styleUrls: ['./right-sidebar.component.scss'],
})
export class RightSidebarComponent implements OnInit {
  static registration = Components.register(RightSidebarComponent, () => require('./right-sidebar.component.json'));

  constructor() { }

  ngOnInit() {
  }

}
