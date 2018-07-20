import React, { Component } from 'react';
import moment from 'moment';

import Styles from './Slot.less';

class Slot extends Component {

    componentDidMount() {
        quip.apps.addEventListener(quip.apps.EventType.DOCUMENT_MEMBERS_LOADED, () => {
            this.props.updateSlot();
        });
    }

    setResponseHandler = () => {
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
            const currentResponse = myResponse.get('type');
            if (currentResponse == 'yes') {
                myResponse.set('type', 'no');
            } else {
                myResponse.set('type', 'yes');
            }
        } else {
            slot.get('responses').add({
                userId: quip.apps.getViewingUser().getId(),
                type: 'yes'
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

        const styles = [Styles.SlotBox];
        if (accepted) {
            styles.push(Styles.Selected);
        }
        if (endTime.valueOf() - startTime.valueOf() < 60*60*1000) {
            styles.push(Styles.ThirtyMin);
        }

        let docMembers = quip.apps.getDocumentMembers();
        console.log(docMembers);

        let height = 0;
        let heightStyles = [Styles.HeightBox];
        if (docMembers.length > 0) {
            height = acceptedResponses.length / docMembers.length * 100;
            if (height == 100) {
                heightStyles.push(Styles.OneHundredPercent);
            }
        }

        console.log(height);
    
        return <div className={styles.join(' ')} onClick={this.setResponseHandler}>
            <div style={{zIndex: '10'}}>
                <div style={{color: '#494949', fontSize: '18px'}}>{startTime.format('LT')}</div>
                <div style={{color: '#7D7D7D', fontSize: '14px'}}>{endTime.format('LT')}</div>
            </div>
            <div
                onClick={(event) => {
                    event.stopPropagation();
                    this.props.deleteTimeslot(this.props.startOfDay, this.props.slot);
                }}
                style={{zIndex: '10', position: 'absolute', top: '7px', right: '10px', cursor: 'pointer', color: '#7D7D7D'}}>
                X
            </div>
            <div style={{alignSelf: 'flex-end', zIndex: '10'}}>
                <div style={{fontWeight: 'bold', color: '#494949'}}>{acceptedResponses.length}</div>
            </div>

            <div className={heightStyles.join(' ')} style={{height: height + '%'}}></div>

            {/* {profilePictures} */}
        </div>;
    }
};

export default Slot;