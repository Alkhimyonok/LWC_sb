import { LightningElement, wire, track, api } from 'lwc';
import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c';
import { subscribe, APPLICATION_SCOPE, MessageContext } from 'lightning/messageService';
const LONGITUDE_FIELD = 'Boat__c.Geolocation__Longitude__s';
const LATITUDE_FIELD = 'Boat__c.Geolocation__Latitude__s';
const BOAT_FIELDS = [LONGITUDE_FIELD, LATITUDE_FIELD];
import { getRecord } from 'lightning/uiRecordApi';
export default class BoatMap extends LightningElement {
  @track subscription = null;
  @track boatId;

  @api get recordId() {
    return this.boatId;
  }
  set recordId(value) {
    this.setAttribute('boatId', value);
    this.boatId = value;
  }


  @api error = undefined;
  @api mapMarkers = [];

  @wire(MessageContext)
  messageContext;

  // Getting record's location to construct map markers using recordId
  // Wire the getRecord method using ('$boatId')
  @wire(getRecord, { recordId: '$boatId', fields: BOAT_FIELDS })
  wiredRecord({ error, data }) {
    if (data) {
      this.error = undefined;
      const longitude = data.fields.Geolocation__Longitude__s.value;
      const latitude = data.fields.Geolocation__Latitude__s.value;
      this.updateMap(longitude, latitude);
    } else if (error) {
      this.error = error;
      this.boatId = undefined;
      this.mapMarkers = [];
    }
  }

  connectedCallback() {
    this.subscription = subscribe(
      this.messageContext,
      BOATMC,
      (message) => this.handleMessage(message),
      { scope: APPLICATION_SCOPE }
    );
    if (this.subscription || this.recordId) {
      return;
    }
  }

  handleMessage(message) {
    this.recordId = message.recordId;
  }

  updateMap(Longitude, Latitude) {
    this.mapMarkers.push(Longitude);
    this.mapMarkers.push(Latitude);
  }

  get showMap() {
    return this.mapMarkers.length > 0;
  }
}