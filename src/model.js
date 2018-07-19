import quip from 'quip';

export class Root extends quip.apps.RootRecord {
    static getProperties() {
        return {
            createdAt: 'number',
            timeSlots: quip.apps.RecordList.Type(Timeslot)
        };
    }

    static getDefaultProperties() {
        return {
            createdAt: Date.now(),
            timeSlots: []
        }
    }
}

export class Timeslot extends quip.apps.Record {
    static getProperties() {
        return {
            startTime: 'number',
            endTime: 'number',
            responses: quip.apps.RecordList.Type(Response)
        };
    }

    static getDefaultProperties() {
        return {
            responses: []
        }
    }

    supportsComments() {
        return true;
    }
}

export class Response extends quip.apps.Record {
    static getProperties() {
        return {
            userId: 'string',
            type: 'string'
        };
    }
}