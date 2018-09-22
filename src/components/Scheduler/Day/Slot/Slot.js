import React, { Component } from 'react';
import moment from 'moment';

import Icon from '../../../Icon/Icon';
import Dialog from '../../../dialog/dialog';
import Tooltip from '../../../Tooltip/Tooltip';
import { createUrlWithQuery } from '../../../../shared/utils';

import Styles from './Slot.less';

class Slot extends Component {

    state = {
        isDeleting: false,
        attendeesTooltipOpen: false,
        availabilityTooltipOpen: false,
        availability: {
            loading: true,
            error: null,
            items: []
        }
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

        this.checkAvailability();
    }

    componentDidUpdate(prevProps) {
        if (this.props.calendarLogin !== prevProps.calendarLogin) {
            this.checkAvailability();
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

    toggleAttendeesTooltip = (e, newState) => {
        if (e) {
            e.stopPropagation();
        }
        let newTooltipState = newState;
        if (!newTooltipState) {
            newTooltipState = !this.state.attendeesTooltipOpen;
        }
        this.setState({ attendeesTooltipOpen: newTooltipState });
    }

    toggleAvailabilityTooltip = (e, newState) => {
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

    checkAvailability = () => {
        this.setState({
            availability: {
                loading: true,
                error: null,
                items: []
            }
        });

        if (this.props.calendarLogin) {
            const startTime = moment(this.props.slot.get('startTime'));
            const endTime = moment(this.props.slot.get('endTime'));
            this.props.checkCalendarAvailability(startTime, endTime)
                .then(events => {
                    this.setState({
                        availability: {
                            loading: false,
                            error: null,
                            items: events
                        }
                    });
                })
                .catch(err => {
                    this.setState({
                        availability: {
                            loading: false,
                            error: err,
                            items: []
                        }
                    });
                });
        }
    }

    authRequest = (auth, requestParams) => {
        if (auth && auth.isLoggedIn()) {
            return auth.request(requestParams)
                .then(response => {
                    if (response.ok) {
                        return response.json();
                    } else if (response.status == 401) {
                        return auth.refreshToken()
                            .then(() => auth.request(requestParams))
                            .then(response => {
                                if (response.ok) {
                                    console.log('Refreshed token');
                                    return response.json();
                                } else {
                                    const err = new Error(response.statusText);
                                    err.status = response.status;
                                    throw err;
                                }
                            })
                            .catch(err => {
                                throw err;
                            });
                    } else {
                        const err = new Error(response.statusText);
                        err.status = response.status;
                        throw err;
                    }
                });
        } else {
            const err = new Error('Missing auth or not logged in');
            return Promise.reject(err);
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

        let profilePictures, attendeesTooltip, deletingDialog, availabilityTooltip;
        if (editable) {
            if (this.state.attendeesTooltipOpen) {
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
                    attendeesTooltip = <Tooltip onBlur={() => this.toggleAttendeesTooltip(null, false)}>
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

            if (this.state.availabilityTooltipOpen && this.state.availability.items.length > 0) {
                const calendarEvents = this.state.availability.items.map(event => {
                    let startTime = moment(event.start.dateTime);
                    let endTime = moment(event.end.dateTime);
                    let isAllDayEvent = false;
                    if ((startTime.isSame(startTime.clone().startOf('day')) && endTime.isSame(endTime.clone().startOf('day'))) || (event.start.dateTime.length == 10 && event.end.dateTime.length == 10)) {
                        isAllDayEvent = true;
                    }
                    return <div key={event.id} onClick={() => quip.apps.openLink(event.htmlLink)} style={{ backgroundColor: quip.apps.ui.ColorMap.BLUE.VALUE_LIGHT }}>
                        <div style={{ color: '#666666' }}>{event.summary}</div>
                        {isAllDayEvent
                            ? <div style={{ color: '#ADADAD' }}>All day</div>
                            : <div style={{ color: '#ADADAD' }}>{startTime.format('LT')} &mdash; {endTime.format('LT')}</div>}
                    </div>
                });

                availabilityTooltip = <Tooltip onBlur={() => this.toggleAvailabilityTooltip(null, false)} marginLeft="-80px">
                    <div onClick={e => e.stopPropagation()} style={{ width: '200px', padding: '5px' }}>
                        <div style={{ color: '#666666', textAlign: 'center' }}>CALENDAR CLASHES</div>
                        <div className={Styles.AvailabilitySlots}>
                            {calendarEvents}
                        </div>
                    </div>
                </Tooltip>;
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

        let calendarAvailability;
        if (this.state.availability && !this.state.availability.loading && !this.state.availability.error) {
            if (this.state.availability.items.length > 0) {
                // Busy
                calendarAvailability = <div className={[Styles.AnswersBox, accepted ? Styles.AnswersBoxGreen : null].join(' ')} onClick={this.toggleAvailabilityTooltip}>
                    <Icon type="monthlyview" width={18} height={18} color='#7D7D7D' />
                    <Icon type="warning" width={18} height={18} color={quip.apps.ui.ColorMap.YELLOW.VALUE} />
                </div>;
            } else {
                // Free
                calendarAvailability = <div className={[Styles.AnswersBox, accepted ? Styles.AnswersBoxGreen : null].join(' ')} onClick={this.toggleAvailabilityTooltip}>
                    <Icon type="monthlyview" width={18} height={18} color='#7D7D7D' />
                    <Icon type="check" width={18} height={18} color={quip.apps.ui.ColorMap.GREEN.VALUE} />
                </div>;
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

                <div className={Styles.BottomRightOptions}>
                    {calendarAvailability}
                    <div className={[Styles.AnswersBox, accepted ? Styles.AnswersBoxGreen : null, acceptedResponses.length > 0 ? Styles.AnswersBoxClickable : null].join(' ')} onClick={this.toggleTooltip}>
                        <Icon type="check" width={18} height={18} color={accepted ? quip.apps.ui.ColorMap.GREEN.VALUE : '#494949'} />
                        <div style={{ fontWeight: 'bold', color: accepted ? quip.apps.ui.ColorMap.GREEN.VALUE : '#494949' }}>{acceptedResponses.length}</div>
                    </div>
                </div>

                <div style={{ zIndex: '10', position: 'absolute', bottom: '7px', left: '10px' }} onClick={(e) => e.stopPropagation()}>
                    <quip.apps.ui.CommentsTrigger record={slot} color="GREEN" showEmpty />
                </div>
                <div className={heightStyles.join(' ')} style={{ height: height + '%', backgroundColor: quip.apps.ui.ColorMap.GREEN.VALUE_LIGHT }}></div>

                {editable ? attendeesTooltip : null}
                {editable ? availabilityTooltip : null}
            </div>
            {editable ? deletingDialog : null}
        </div>;
    }
};

export default Slot;