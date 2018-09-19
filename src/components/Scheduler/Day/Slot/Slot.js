import React, { Component } from 'react';
import moment from 'moment';

import Icon from '../../../Icon/Icon';
import Dialog from '../../../dialog/dialog';
import Tooltip from '../../../Tooltip/Tooltip';

import Styles from './Slot.less';

class Slot extends Component {

    state = {
        isDeleting: false,
        tooltipOpen: false
    }

    componentDidMount() {
        quip.apps.addEventListener(quip.apps.EventType.DOCUMENT_MEMBERS_LOADED, () => {
            this.props.updateSlot();
        });

        // Start listening for remote updates/changes
        const responses = this.props.slot.get('responses');
        if (responses) {
            responses.listen(this.remoteUpdateHandler);
        }
    }

    componentWillUnmount() {
        // Stop listening for remote updates/changes
        const responses = this.props.slot.get('responses');
        if (responses) {
            responses.unlisten(this.remoteUpdateHandler);
        }
    }

    remoteUpdateHandler = () => {
        this.props.updateSlot();
    }

    setResponseHandler = () => {
        const slot = this.props.slot;
        let responses = [];
        if (slot.has('responses')) {
            responses = slot.get('responses').getRecords();
        }

        const me = quip.apps.getViewingUser();

        if (me) {
            const myResponse = responses.find(response => {
                const userId = response.get('userId');
                return userId == me.getId();
            });

            if (myResponse) {
                const currentResponse = myResponse.get('type');
                if (currentResponse == 'yes') {
                    myResponse.set('type', 'no');
                    quip.apps.sendMessage(`rejected the slot on ${moment(this.props.slot.get('startTime')).format('LLL')} - ${moment(this.props.slot.get('endTime')).format('LT Z')}.`);
                } else {
                    myResponse.set('type', 'yes');
                    quip.apps.sendMessage(`accepted the slot on ${moment(this.props.slot.get('startTime')).format('LLL')} - ${moment(this.props.slot.get('endTime')).format('LT Z')}.`);
                }
            } else {
                slot.get('responses').add({
                    userId: me.getId(),
                    type: 'yes'
                });
                quip.apps.sendMessage(`accepted the slot on ${moment(this.props.slot.get('startTime')).format('LLL')} - ${moment(this.props.slot.get('endTime')).format('LT Z')}.`);
            }

            this.props.updateSlot();
        }

        this.toggleTooltip(null, false);

    }

    updateNode = (node) => {
        this.props.slot.setDom(node);
    }

    dismissDialog = (e) => {
        if (e) {
            e.stopPropagation();
        }
        this.setState({ isDeleting: false });
    }

    deleteSlot = (e) => {
        e.stopPropagation();
        this.props.deleteTimeslot(this.props.startOfDay, this.props.slot);
    }

    openDialog = (e) => {
        e.stopPropagation();
        this.setState({ isDeleting: true });
    }

    toggleTooltip = (e, newState) => {
        if (e) {
            e.stopPropagation();
        }

        const responses = this.props.slot.get('responses').getRecords();
        const acceptedResponses = responses.filter(response => {
            const type = response.get('type');
            return type == 'yes';
        });

        if (acceptedResponses.length > 0) {
            let newTooltipState = newState;
            if (newTooltipState == null || newTooltipState == undefined) {
                newTooltipState = !this.state.tooltipOpen;
            }
            this.setState({ tooltipOpen: newTooltipState });
        }
    }

    render() {
        const slot = this.props.slot;
        const startTime = moment(slot.get('startTime'));
        const endTime = moment(slot.get('endTime'));
        const me = quip.apps.getViewingUser();
        const editable = quip.apps.isDocumentEditable() && quip.apps.getViewingUser();

        let responses = [];
        if (slot.has('responses')) {
            responses = slot.get('responses').getRecords();
        }

        const myResponse = responses.find(response => {
            const userId = response.get('userId');
            if (me) {
                return userId == me.getId();
            } else {
                return false;
            }
        });

        let accepted = false;
        if (myResponse && myResponse.get('type') == 'yes') {
            accepted = true;
        }

        const acceptedResponses = responses.filter(response => {
            const type = response.get('type');
            return type == 'yes';
        });

        let profilePictures, tooltip, deletingDialog;
        if (editable) {
            if (this.state.tooltipOpen) {
                profilePictures = acceptedResponses.map(response => {
                    const userId = response.get('userId');
                    const user = quip.apps.getUserById(userId);

                    if (user) {
                        const userName = user.getName();
                        return <div title={userName}>
                            <quip.apps.ui.ProfilePicture
                                key={userId}
                                user={user}
                                size={35}
                                round
                            />
                        </div>;
                    } else {
                        return null;
                    }
                });

                if (profilePictures.length > 0) {
                    tooltip = <Tooltip onBlur={() => this.toggleTooltip(null, false)}>
                        <div className={Styles.ProfilePicturesBox} onClick={e => e.stopPropagation()}>
                            {profilePictures}
                        </div>
                    </Tooltip>;
                }

            }

            if (this.state.isDeleting) {
                deletingDialog = <Dialog onDismiss={this.dismissDialog}>
                    <div className={Styles.dialog}>
                        <div className={Styles.header}>
                            {quiptext("Delete Time Slot")}
                        </div>
                        <div className={Styles.picker} style={{ minHeight: 'auto', padding: '0px 40px 20px 40px', alignItems: 'center' }}>
                            Are you sure you want to delete the time slot?<br />
                            All responses will be lost.
                        </div>
                        <div className={Styles.actions}>
                            <quip.apps.ui.Button
                                text={quiptext("Cancel")}
                                onClick={this.dismissDialog} />
                            <quip.apps.ui.Button
                                primary={true}
                                text={quiptext("Delete")}
                                onClick={this.deleteSlot} />
                        </div>
                    </div>
                </Dialog>;
            }
        }

        const styles = [Styles.SlotBox];
        if (accepted) {
            styles.push(Styles.Selected);
        }
        if (endTime.valueOf() - startTime.valueOf() < 60 * 60 * 1000) {
            styles.push(Styles.ThirtyMin);
        }

        let docMembers = quip.apps.getDocumentMembers();

        let height = 0;
        let heightStyles = [Styles.HeightBox];
        if (docMembers.length > 0) {
            height = acceptedResponses.length / docMembers.length * 100;
            if (height == 100) {
                heightStyles.push(Styles.OneHundredPercent);
            }
        }

        return <div>
            <div
                className={styles.join(' ')}
                style={{ borderColor: accepted ? quip.apps.ui.ColorMap.GREEN.VALUE : null }}
                onClick={this.setResponseHandler}
                ref={this.updateNode}>
                <div style={{ zIndex: '10' }}>
                    <div style={{ color: '#494949', fontSize: '18px' }}>{startTime.format('LT')}</div>
                    <div style={{ color: '#7D7D7D', fontSize: '14px' }}>{endTime.format('LT')}</div>
                </div>
                {editable && !this.props.isMobile ? <div
                    onClick={this.openDialog}
                    style={{ zIndex: '10', position: 'absolute', top: '7px', right: '10px', cursor: 'pointer' }}>
                    <Icon type="close" width={18} height={18} color="#7D7D7D" />
                </div> : null}
                <div className={[Styles.AnswersBox, accepted ? Styles.AnswersBoxGreen : null, acceptedResponses.length > 0 ? Styles.AnswersBoxClickable : null].join(' ')} onClick={this.toggleTooltip}>
                    <Icon type="user" width={18} height={18} color={accepted ? quip.apps.ui.ColorMap.GREEN.VALUE : '#494949'} />
                    <div style={{ fontWeight: 'bold', color: accepted ? quip.apps.ui.ColorMap.GREEN.VALUE : '#494949' }}>{acceptedResponses.length}</div>
                </div>

                <div style={{ zIndex: '10', position: 'absolute', bottom: '7px', left: '10px' }} onClick={(e) => e.stopPropagation()}>
                    <quip.apps.ui.CommentsTrigger record={slot} color="GREEN" showEmpty />
                </div>
                <div className={heightStyles.join(' ')} style={{ height: height + '%', backgroundColor: quip.apps.ui.ColorMap.GREEN.VALUE_LIGHT }}></div>

                {editable ? tooltip : null}
            </div>
            {editable ? deletingDialog : null}
        </div>;
    }
};

export default Slot;