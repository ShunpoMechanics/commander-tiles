import { Component, ViewChild } from '@angular/core';
import { BulkData } from './interfaces/bulk-data';
import { CardTile } from './interfaces/card-tile';
import { HttpClient } from '@angular/common/http';
import { Card } from './interfaces/card';
import { AlertController, IonModal } from '@ionic/angular';
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
  
  constructor(private http: HttpClient, private alertController: AlertController) {
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

  filterCards() {
    var list = this.filteredCards.filter(value => this.tiles.findIndex(t => t.name == value.name || t.name.includes(value.name) || value.name.includes(t.name)) == -1);    
    return list.slice(0, 100);
  }

  filter() {
    var filter = <HTMLInputElement>document.getElementById("filter");
    this.filteredCards = this.cards.filter(f => f.name.toLowerCase().includes(filter.value?.toLowerCase()!));
  }

  cancel() {
    this.modal.dismiss(null, 'cancel');
  }

  redrawAllTiles() {
    this.tileCount = 0;
    var backup = [...this.tiles];
    this.tiles = [];

    var elements = document.getElementsByTagName("img");
    var arr = Array.prototype.slice.call( elements )
    arr.forEach(item => {
      var element = document.getElementById(item.id);
      element?.remove();
      element = document.getElementById("edit-"+item.id);
      element?.remove();
      element = document.getElementById("delete-"+item.id);
      element?.remove();
    });

    backup.forEach(tile => {
      var card = this.cards[this.cards.findIndex(f => f.id == tile.id)];
      this.addTile(card);
    });
  }

  delete(id: string) {
    var index = this.tiles.findIndex(t => t.id == id);    
    this.tiles.splice(index, 1);
    this.redrawAllTiles();    
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
    col.innerHTML = `<img id="${data.id}"src=\"${data.image_uris.art_crop}\"><ion-icon id="edit-${data.id}" style="position: absolute !important; right: 11px !important; top: 15px !important; font-size: 37px !important;" name="ellipsis-vertical-outline"></ion-icon><ion-icon id="delete-${data.id}" style="position: absolute !important; right: 11px !important; top: 64px !important; font-size: 37px !important;" name="trash-outline"></ion-icon>`;
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

    var editIcon = document.getElementById(`edit-${data.id}`);
    editIcon?.addEventListener("click", (ev) => {

    });

    var deleteIcon = document.getElementById(`delete-${data.id}`);
    deleteIcon?.addEventListener("click", (ev) => {
      var id = (<HTMLImageElement>ev.target).id.substring(7);
      var tile = this.tiles[this.tiles.findIndex(t => t.id == id)];
      this.presentAlert(tile.name, id);
    });

    this.tileCount++;   
    var tile = { id: data.id, name: data.name, img: data.image_uris.art_crop, status: "enabled", wins: 0, losses: 0, colors: data.colors } as CardTile;
    this.tiles.push(tile);
    this.modal.dismiss(this.name, 'cancel');
    this.filteredCards = this.cards;
  }

    setResult(ev: any) {
      // console.log(`Dismissed with role: ${ev.detail.role}`);
    }

    async presentAlert(name: string, id: string) {
      const alert = await this.alertController.create({
        header: 'Confirm Deletion',
        message: `Delete ${name}? You will lose all history for this commander.`,
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => {
              this.modal.dismiss();
            },
          },
          {
            text: 'OK',
            role: 'confirm',
            handler: () => {
              this.delete(id);
            },
          },
        ],
      });
  
      await alert.present();
    }
 
}
