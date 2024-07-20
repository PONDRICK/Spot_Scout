import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  private mapData: any;

  setMapData(data: any) {
    this.mapData = data;
  }

  getMapData() {
    return this.mapData;
  }

  clearMapData() {
    this.mapData = null;
  }
}
