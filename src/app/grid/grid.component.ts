import { Component, Input, OnInit } from '@angular/core';
import { CardTile } from '../interfaces/card-tile';
import { HttpClient } from '@angular/common/http';
import { BulkData, Data } from '../interfaces/bulk-data';
import { Card } from '../interfaces/card';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss'],
})
export class GridComponent  implements OnInit {
  @Input() events: Observable<Card>;
  private eventsSubscription: Subscription;
  
  bulkData: BulkData;
  cards: CardTile[];
  loading: boolean;
  
  constructor() {}

  ngOnInit() {
    // this.eventsSubscription = this.events.subscribe((data: Card) => this.addTile(data));
  }

  ngOnDestroy() {
    this.eventsSubscription.unsubscribe();
  }

  addTile(data: Card) {
    var x = document.getElementById("content");
    var element = new HTMLElement();
    element.innerHTML = `<img src=\"${data.image_uris.art_crop}\"`;
    x?.appendChild(element)
  }

}
