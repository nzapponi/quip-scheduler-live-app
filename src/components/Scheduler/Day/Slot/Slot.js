import React, { Component } from 'react';
import moment from 'moment';

class Slot extends Component {

    componentDidMount() {
        quip.apps.addEventListener(quip.apps.EventType.DOCUMENT_MEMBERS_LOADED, () => {
            this.props.updateSlot();
        });
    }

    setResponseHandler = (response) => {
        const slot = this.props.slot;
        let responses = [];
        if (slot.has('responses')) {
            responses = slot.get('responses').getRecords();
        }
    
        const myResponse = responses.find(response => {
            const userId = response.get('userId');
            return userId == quip.apps.getViewingUser().getId();
        });

        if (myResponse) {
            myResponse.set('type', response);
        } else {
            slot.get('responses').add({
                userId: quip.apps.getViewingUser().getId(),
                type: response
            });
        }

        this.props.updateSlot();
    }

    render() {
        const slot = this.props.slot;
    
        const startTime = moment(slot.get('startTime'));
        const endTime = moment(slot.get('endTime'));
        let responses = [];
        if (slot.has('responses')) {
            responses = slot.get('responses').getRecords();
        }
    
        const myResponse = responses.find(response => {
            const userId = response.get('userId');
            return userId == quip.apps.getViewingUser().getId();
        });
    
        let accepted = false;
        if (myResponse && myResponse.get('type') == 'yes') {
            accepted = true;
        }

        const acceptedResponses = responses.filter(response => {
            const type = response.get('type');
            return type == 'yes';
        });

        const profilePictures = acceptedResponses.map(response => {
            const userId = response.get('userId');
            const user = quip.apps.getUserById(userId);
            
            if (user) {
                return <quip.apps.ui.ProfilePicture
                    key={userId}
                    user={user}
                    size={50}
                    round
                />;
            } else {
                return null;
            }
        });
    
        let responseButton = <quip.apps.ui.Button
            text={quiptext("Accept")}
            onClick={() => this.setResponseHandler('yes')} />;
        if (accepted) {
            responseButton = <quip.apps.ui.Button
            text={quiptext("Decline")}
            onClick={() => this.setResponseHandler('no')} />;
        }
    
        return <div onClick={(event) => event.stopPropagation()}>
            <p><b>Start</b>: {startTime.format('LT')}, <b>End</b>: {endTime.format('LT')}, Accepted: {acceptedResponses.length}</p>

            {profilePictures}
            
            {responseButton}
            
            <quip.apps.ui.Button
                text={quiptext("Delete slot")}
                onClick={() => this.props.deleteTimeslot(this.props.startOfDay, this.props.slot)} />
        </div>;
    }
};

export default Slot;