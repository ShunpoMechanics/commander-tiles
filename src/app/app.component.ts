import { Component, ViewChild } from '@angular/core';
import { BulkData } from './interfaces/bulk-data';
import { CardTile } from './interfaces/card-tile';
import { HttpClient } from '@angular/common/http';
import { Card } from './interfaces/card';
import { IonModal } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core/components';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  @ViewChild(IonModal) modal: IonModal;
  
  public appPages = [
    { title: 'Commanders', url: '/grid', icon: 'grid' },
  ];
  // public labels = ['Family', 'Friends', 'Notes', 'Work', 'Travel', 'Reminders'];
  
  bulkData: BulkData;
  cards: Card[];
  filteredCards: Card[];
  tiles: CardTile[];
  isMobile: boolean;
  loading: boolean; 
  tileCount: number;
  name: string;
  colCount: number;
  
  constructor(private http: HttpClient) {
    this.cards = [];
    this.filteredCards = [];
    this.bulkData = {} as BulkData;
    this.tiles = [];
    this.loading = true;
    this.tileCount = 0;
   }

  ngOnInit() {    
    this.loadScryfallData();
    this.isMobile = this.detectMobile();
    this.colCount = this.isMobile ? 2 : 4;
  }

  loadScryfallData() {
    this.http.get('https://api.scryfall.com/bulk-data').subscribe((data: any) => {
      this.bulkData.object = data["object"]; 
      this.bulkData.data = data["data"];
      this.bulkData.has_more = data["has_more"];       
       
      var unique_artworkIndex = this.bulkData.data.findIndex(b => b.type == "unique_artwork");
      var unique_artwork = this.bulkData.data[unique_artworkIndex];

      this.http.get(unique_artwork.download_uri).subscribe((data: any) => {      
        var items = data as Card[];
        items.forEach((item: Card) => {          
          if("type_line" in item){            
              if(item?.type_line.includes("Legendary Creature")) {                
                if("card_faces" in item)
                {
                  if(item?.card_faces.length > 1)
                  {
                    item!.image_uris = item?.card_faces[0].image_uris;
                  }
                }
                if(item.image_uris != null)
                  this.cards.push(item);                  
              }
          }
        });
        this.cards.sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
        this.filteredCards = this.cards;
        this.loading = false;        
        document.getElementById("content")!.style.display = 'block';
      });
    });
  }

  filter() {
    var filter = <HTMLInputElement>document.getElementById("filter");
    this.filteredCards = this.cards.filter(f => f.name.toLowerCase().includes(filter.value?.toLowerCase()!));
  }

  cancel() {
    this.modal.dismiss(null, 'cancel');
  }

  confirm() {
    this.modal.dismiss(this.name, 'confirm');
  }

  onWillDismiss(event: Event) {
    const ev = event as CustomEvent<OverlayEventDetail<string>>;
    if (ev.detail.role === 'confirm') {
      this.addTile(this.cards[0]);
    }
  }

  detectMobile() {
    return ( ( window.innerWidth <= 800 ));
  }

  addTile(data: Card) {
    var grid = document.getElementById("grid");
    var rows = document.getElementsByTagName("ion-row");
    var lastRow = rows[rows.length-1];

    if(this.tileCount % this.colCount == 0 && this.tileCount != 0)
    {
      var newRow = document.createElement("ion-row");
      grid?.appendChild(newRow);
      lastRow = newRow;

      var newCol1 = document.createElement("ion-col");
      var newCol2 = document.createElement("ion-col");      
      lastRow.appendChild(newCol1);
      lastRow.appendChild(newCol2);

      if(!this.isMobile){
        var newCol3 = document.createElement("ion-col");
        var newCol4 = document.createElement("ion-col");
        lastRow.appendChild(newCol3);
        lastRow.appendChild(newCol4);
      }
    }

    var cols = lastRow.children;
    var col = cols[this.tileCount % this.colCount];
    col.innerHTML = `<img id="${data.id}"src=\"${data.image_uris.art_crop}\">`;
    col.addEventListener("click", (ev) => {
      var id = (<HTMLImageElement>ev.target).id;
      var x = document.getElementById(id);
        if(this.tiles[this.tiles.findIndex(f => f.id == id)].status == "disabled")
        {
          x!.style.filter = "grayscale(0%)";
          this.tiles[this.tiles.findIndex(f => f.id == id)].status = "enabled";
        }
        else {
          x!.style.filter = "grayscale(100%)";
          this.tiles[this.tiles.findIndex(f => f.id == id)].status = "disabled";
        }
    });

    this.tileCount++;   
    var tile = { id: data.id, name: data.name, img: data.image_uris.art_crop, status: "enabled" } as CardTile;
    this.tiles.push(tile);
  }


 
}
