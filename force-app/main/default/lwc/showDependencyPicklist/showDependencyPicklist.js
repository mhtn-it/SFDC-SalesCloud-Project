import { LightningElement, wire, api, track } from "lwc";
import { getObjectInfo, getPicklistValuesByRecordType } from "lightning/uiObjectInfoApi";
import getRecordTypeFromApex from '@salesforce/apex/ShowDependencyPicklistController.getRecordTypeId';
import { refreshApex } from '@salesforce/apex';

const columns = [
    { label: 'Level 1', fieldName: 'level1' },
    { label: 'Level 2', fieldName: 'level2' },
    { label: 'Level 3', fieldName: 'level3' },
];

export default class ShowDependencyPicklist extends LightningElement {
    @api recordId;
    @track objectName = 'Lead';

    @track recordTypeIdRetail;
    @track recordTypeIdBusiness;

    @track data = {};
    @track resultController = {};
    @track reasonController = {};
    @track result = [];
    @track columns = columns;
    @track lstRecordTypes = [];
    @track selectedRecordType;

    @wire(getObjectInfo, { objectApiName: '$objectName' })

    getObjectInfo({ error, data }) {
        if (data) {
            this.lstRecordTypes = [];
            for (let key in data.recordTypeInfos) {
                this.lstRecordTypes.push({ value: key, label: data.recordTypeInfos[key].name });
            }
        }
        else if (error) {
            console.log('Error while get record types');
            this.lstRecordTypes = [];
        }
    }

    reverseMapping = o => Object.keys(o).reduce((r, k) =>
        Object.assign(r, { [o[k]]: (r[o[k]] || []).concat(k) }), {})

    @wire(getPicklistValuesByRecordType, { recordTypeId: "$recordTypeIdRetail", objectApiName: '$objectName' })
    picklistValues({ error, data }) {
        if (data) {
            this.data = data;
            this.resultController = this.reverseMapping(data.picklistFieldValues.Result__c.controllerValues);
            this.reasonController = this.reverseMapping(data.picklistFieldValues.Reason__c.controllerValues);
        } else if (error) {
            console.log(error);
        }
    }

    connectedCallback() {
        //https://www.salesforcepoint.com/2020/06/how-to-invoke-call-child-lightning-web.html

    }
    handleClick() {
        this.result = [];
        try {
            let level1 = 'Status';
            let level2field = 'Result__c';
            let level3field = 'Reason__c';
            console.log(this.data);
            for (let value3 of this.data.picklistFieldValues[level3field].values) {
                let level1value = '';
                let level2value = '';
                if (value3.validFor.length > 0) {
                    for (let control of value3.validFor) {
                        for (let value2 of this.data.picklistFieldValues[level2field].values) {
                            if (this.reasonController[control] == value2.value) {
                                level2value = this.reasonController[control][0];
                                if (value2.validFor.length > 0) {
                                    for (let control2 of value2.validFor) {
                                        level1value = this.resultController[control2][0];
                                        this.result.push({ level1: level1value, level2: value2.value, level3: value3.value });
                                    }
                                } else {
                                    this.result.push({ level1: level1value, level2: value2.value, level3: value3.value });
                                }
                            }
                        }
                    }
                } else {
                    this.result.push({ level1: level1value, level2: level2value, level3: value3.value });
                }
            }
            console.log(JSON.stringify(this.result));
        } catch (e) {
            console.log(e.message + '\n' + e.stack);
        }
    }

    handleChange(event) {
        this.selectedRecordType = event.detail.value;
        getRecordTypeFromApex({ objectName: 'Lead', recordTypeName: this.selectedRecordType })
            .then((result) => {
                this.recordTypeIdRetail = result;
                console.log(result);
            })
            .catch((error) => {
                console.log(error);
            });
        refreshApex(this.picklistValues);
    }
}