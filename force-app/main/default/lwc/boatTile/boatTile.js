import { LightningElement, api } from 'lwc';
const TILE_WRAPPER_SELECTED_CLASS = "tile-wrapper selected";
const TILE_WRAPPER_UNSELECTED_CLASS = "tile-wrapper";
export default class BoatTile extends LightningElement {
    @api boat;
    @api selectedBoatId;

    get backgroundStyle() {
        return `background-image: url(${this.boat.Picture__c})`;
    }
    get tileClass() {
        if(this.selectedBoatId===this.boat.Id){
            return this.TILE_WRAPPER_SELECTED_CLASS;
        } else {
            return this.TILE_WRAPPER_UNSELECTED_CLASS;
        }
    }

    // Fires event with the Id of the boat that has been selected.
    selectBoat(event) {
        const boatSelectEvent = new CustomEvent('boatselect', { detail: { boatId: this.boat.Id } });
        this.dispatchEvent(boatSelectEvent);
    }
}
