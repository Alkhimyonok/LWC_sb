import { LightningElement, wire, api, track } from 'lwc';
import { MessageContext, publish } from 'lightning/messageService';
import BOATMC from "@salesforce/messageChannel/BoatMessageChannel__c";
import getBoats from "@salesforce/apex/BoatDataService.getBoats";
import { updateRecord } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
const SUCCESS_TITLE = 'Success';
const SUCCESS_MSG = 'Ship It!';
const ERROR_TITLE = 'Error on data save';
export default class BoatSearchResults extends LightningElement {
    selectedBoatId;
    columns = [{
        label: 'Name',
        fieldName: 'Name',
        editable: true
    },
    {
        label: 'Length',
        fieldName: 'Length__c',
        type: 'number',
        editable: true
    },
    {
        label: 'Price',
        fieldName: 'Price__c',
        type: 'currency',
        editable: true
    },
    {
        label: 'Description',
        fieldName: 'Description__c',
        editable: true
    }
    ];
    @api boatTypeId = '';
    boats;
    isLoading = true;
    wiredBoatResult;
    draftValues = [];

    @wire(MessageContext)
    messageContext;

    @wire(getBoats, { boatTypeId: '$boatTypeId' })
    wiredBoats(result) {

        this.boats = result;

    }

    // public function that updates the existing boatTypeId property
    // uses notifyLoading
    @api
    searchBoats(boatTypeId) {
        this.boatTypeId = boatTypeId;
        this.notifyLoading(true);
    }

    // this public function must refresh the boats asynchronously
    // uses notifyLoading
    @api async refresh() {
        this.notifyLoading(true);
        refreshApex(this.boats);
    }

    // this function must update selectedBoatId and call sendMessageService
    updateSelectedTile(event) {
        //this.selectedBoatId = 
        console.log('[updateSelectedTile]');
        console.log(event.detail.boatId);
        this.selectedBoatId = event.detail.boatId;
        this.sendMessageService(event.detail.boatId);
    }

    // Publishes the selected boat Id on the BoatMC.
    sendMessageService(boatId) {
        console.log('[sendMessageService]');
        const message = {
            recordId: boatId
        };

        publish(this.messageContext, BOATMC, message);
    }

    // This method must save the changes in the Boat Editor
    // Show a toast message with the title
    // clear lightning-datatable draft values
    handleSave(event) {
        const recordInputs = event.detail.draftValues.slice().map(draft => {
            const fields = Object.assign({}, draft);
            return { fields };
        });

        const promises = recordInputs.map(recordInput =>
            //update boat record
            updateRecord(recordInput)
        );
        Promise.all(promises)
            .then(() => {

                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Ship It!',
                        variant: 'success'
                    })
                );
                this.draftValues = [];
                this.refresh();
            }).catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: error,
                        variant: 'error'
                    })
                );
            })
            .finally(() => {

            });
    }
    // Check the current value of isLoading before dispatching the doneloading or loading custom event
    notifyLoading(isLoading) {
        if (isLoading) {
            this.dispatchEvent(new CustomEvent('loading', {
                detail: isLoading
            })
            );
        }
        else {
            this.dispatchEvent(new CustomEvent('doneloading', {
                detail: isLoading
            })
            );
        }
    }
}