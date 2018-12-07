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

    getUniqueUsers() {
        let users = [];

        for (let timeslot of this.get('timeSlots').getRecords()) {
            for (let response of timeslot.get('responses').getRecords()) {
                let user = response.get('userId');
                let responseType = response.get('type');
                if (responseType == 'yes' && users.indexOf(user) == -1) {
                    users.push(user);
                }
            }
        }

        return users;
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

    getDom() {
        return this.node || null;
    }

    setDom(node) {
        this.node = node;
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