import { Component, OnInit, OnChanges, Input, HostBinding } from '@angular/core';

@Component({
  selector: 'gany-grid',
  templateUrl: './gany-grid.component.html',
  styleUrls: ['./gany-grid.component.scss']
})
export class GanyGridComponent implements OnInit, OnChanges {

  @Input() minWidth: string = '16rem';
  @Input() gap: string = '0.9rem 0.6rem';
  @HostBinding('style.grid-template-columns') gridTemplateColumns: string;
  @HostBinding('style.grid-gap') gridGap: string;

  constructor() { }

  ngOnInit() { this.update(); }

  ngOnChanges() { this.update(); }

  update() {
    this.gridTemplateColumns = `repeat(auto-fit, minmax(${this.minWidth}, 1fr))`;
    this.gridGap = this.gap;
  }

}
