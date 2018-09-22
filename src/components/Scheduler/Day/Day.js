import React, { Component } from 'react';
import moment from 'moment';

import Slot from './Slot/Slot';
import Dialog from '../../dialog/dialog';
import Icon from '../../Icon/Icon';

import Styles from './Day.less';

class Day extends Component {

    state = {
        newSlotPicker: false,
        startTime: null,
        endTime: null,
        newSlotError: null,
        pendingPulse: false,
        deletingDay: false,
        pulsing: false,
        newSelectedDate: this.props.validateDate(moment().startOf('day').valueOf()) ? null : moment().startOf('day').valueOf(),
        newDateError: this.props.validateDate(moment().startOf('day').valueOf()) ? 'This date is already selected' : null
    }

    componentDidMount() {
        if (this.props.day.timeslots.length == 0 && this.props.day.timestamp > 0) {
            this.setState({ pendingPulse: true });
        }
    }

    showNewSlotPickerHandler = () => {

        let startTime = moment(this.props.day.timestamp).hours(moment().hours()).minutes(0);

        if (startTime.isSame(moment(), 'day')) {
            if (moment().minutes() < 30) {
                startTime = moment().startOf('hour').add(30, 'minutes');
            } else {
                startTime = moment().startOf('hour').add(1, 'hours');
            }

            if (!startTime.isSame(moment(), 'day')) {
                startTime = moment().endOf('day').subtract(30, 'minutes');
            }
        }

        let endTime = startTime.clone().add(1, 'hours');

        if (!endTime.isSame(startTime, 'day')) {
            endTime = moment().endOf('day');
        }

        // Check if it already exists
        const existingTimeslot = this.props.day.timeslots.find(slot => slot.get('startTime') == startTime && slot.get('endTime') == endTime);

        this.setState({
            newSlotPicker: true,
            startTime: startTime.valueOf(),
            endTime: endTime.valueOf(),
            newSlotError: existingTimeslot ? 'This slot already exists' : null
        });
    }

    dismissDatePicker = () => {
        this.props.dismissDatePicker(this.props.day.timestamp);
        if (this.state.pendingPulse) {
            this.setState({
                pendingPulse: false,
                pulsing: true,
                newDateError: null,
                newSelectedDate: null
            });
        } else {
            this.setState({
                newSelectedDate: null,
                newDateError: null
            });
        }
    }

    dismissNewSlotPicker = () => {
        
        this.setState({
            newSlotPicker: false
        });
    }

    updateTimeHandler = (type, event) => {

        const newTime = +event.target.value;

        if (type === 'start') {
            let newEndTime = this.state.endTime;
            if (newEndTime <= newTime) {
                newEndTime = newTime + 60*60*1000;
                if (!moment(newEndTime).isSame(moment(newTime), 'day')) {
                    newEndTime = moment(newEndTime).startOf('day').valueOf();
                }
            }

            // Check if it already exists
            const existingTimeslot = this.props.day.timeslots.find(slot => slot.get('startTime') == newTime && slot.get('endTime') == newEndTime);

            this.setState({
                startTime: newTime,
                endTime: newEndTime,
                newSlotError: existingTimeslot ? 'This slot already exists' : null
            });
        } else if (type === 'end') {

            // Check if it already exists
            const existingTimeslot = this.props.day.timeslots.find(slot => slot.get('startTime') == this.state.startTime && slot.get('endTime') == newTime);

            this.setState({
                endTime: newTime,
                newSlotError: existingTimeslot ? 'This slot already exists' : null
            });
        }
    }

    createSlotHandler = () => {
        // Create the new slot!

        this.props.createTimeslot(this.props.day.timestamp, this.state.startTime, this.state.endTime);
        this.dismissNewSlotPicker();
    }

    updateSlotHandler = () => {
        this.setState({});
    }

    selectNewDate = (newTimestamp) => {

        // Validate that the timestamp is okay

        const startOfToday = moment().startOf('day').valueOf();
        const startOfSelectedDay = moment(newTimestamp).startOf('day').valueOf();
        if (startOfSelectedDay < startOfToday) {
            // Selected date is in the past. Not okay
            this.setState({
                newSelectedDate: null,
                newDateError: 'You cannot select a date in the past'
            });
        } else if (this.props.validateDate(startOfSelectedDay)) {
            // Selected date already exists. Not okay
            this.setState({
                newSelectedDate: null,
                newDateError: 'This date is already selected'
            });
        } else {
            // Date is okay!
            this.setState({
                newSelectedDate: startOfSelectedDay,
                newDateError: null
            });
        }
    }

    updateNewDate = () => {
        this.props.setNewDate(this.props.day.timestamp, this.state.newSelectedDate);
    }

    openDateDelete = () => {
        this.setState({ deletingDay: true });
    }

    dismissDateDelete = () => {
        this.setState({ deletingDay: false });
    }

    render() {
        const dayConfiguration = this.props.day;
        const editable = quip.apps.isDocumentEditable() && quip.apps.getViewingUser();

        let time = moment(dayConfiguration.timestamp).startOf('day');

        const hours = [];
        for (let i = 0; i < 49; i++) {
            if (time.isSameOrAfter(moment())) {
                hours.push({
                    label: time.format('LT'),
                    value: time.valueOf()
                });
            }
            time = time.add(30, 'minutes');
        }

        let datePicker;
        if (editable && dayConfiguration.configuring) {
            datePicker = <Dialog onDismiss={this.dismissDatePicker} showBackdrop>
                <div className={Styles.dialog}>
                    <div className={Styles.header}>
                        {quiptext("Pick a Date")}
                    </div>
                    <div className={Styles.picker} style={{padding: '0 40px'}}>
                        <quip.apps.ui.CalendarPicker
                            initialSelectedDateMs={this.props.day.timestamp > 0 ? this.props.day.timestamp : Date.now()}
                            onChangeSelectedDateMs={this.selectNewDate}
                        />
                        {this.state.newDateError ? <div className={Styles.DialogError}>{this.state.newDateError}</div> : null}
                    </div>
                    <div className={Styles.actions} style={{padding: '20px 0'}}>
                        <button
                            className={['quip-button-primary', Styles.PrimaryButton].join(' ')}
                            disabled={this.state.newSelectedDate == null}
                            onClick={this.updateNewDate} >
                            <Icon type="forward" width={15} height={15} />
                        </button>
                    </div>
                </div>
            </Dialog>;
        }

        let slots = <div style={{color: quip.apps.ui.ColorMap.BLUE.VALUE, padding: '0px 20px', cursor: 'pointer'}} onClick={this.showNewSlotPickerHandler}>Start by adding a new time slot!</div>;

        if (dayConfiguration.timeslots.length > 0) {
            slots = dayConfiguration.timeslots.sort((slotA, slotB) => {
                let timeA = slotA.get('startTime');
                let timeB = slotB.get('startTime');
                if (timeA == timeB) {
                    timeA = slotA.get('endTime');
                    timeB = slotB.get('endTime');
                }
                return timeA - timeB;
            }).map((slot) => {
                const key = slot.get('startTime') + '-' + slot.get('endTime');
                return <Slot
                    key={key}
                    startOfDay={dayConfiguration.timestamp}
                    slot={slot}
                    deleteTimeslot={this.props.deleteTimeslot}
                    updateSlot={this.updateSlotHandler}
                    isMobile={this.props.isMobile}
                    googleLogin={this.props.googleLogin} />;
            });
        }


        let prettyDay = <div onClick={() => this.props.openDatePicker(this.props.day.timestamp)} style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%'}}>
            <div style={{color: '#ADADAD', textTransform: 'uppercase', padding: '0 5px', textAlign: 'center'}}>
                <Icon type="add" color="#EFEFEF" width={50} height={50} />
            </div>
        </div>;

        let slotsBlock;

        if (this.props.day.timestamp > 0) {
            const momentTime = moment(this.props.day.timestamp);
            prettyDay = <div style={{padding: '15px 10px'}}>
                <div className={Styles.DayNumber}>{momentTime.format('D')}</div>
                <div className={Styles.DayDetails}>{momentTime.format('MMM')} &#183; {momentTime.format('ddd')}</div>
            </div>;

            let slotsBlockStyle = Styles.DayColumn;
            if (dayConfiguration.timeslots.length == 0) {
                if (this.props.isMobile) {
                    slotsBlockStyle = [Styles.NewDayColumn, Styles.Mobile].join(' ');
                } else {
                    slotsBlockStyle = Styles.NewDayColumn;
                }
            }

            slotsBlock = <div className={slotsBlockStyle}>
                {slots}
            </div>;
        }

        let newSlotPicker;
        if (editable && this.state.newSlotPicker) {
            newSlotPicker = <Dialog onDismiss={this.dismissNewSlotPicker}>
                <div className={Styles.dialog}>
                    <div className={Styles.header}>
                        {quiptext("Select a Time")}
                    </div>
                    <div className={Styles.picker} style={{minHeight: 'auto', padding: '0px 40px 20px 40px'}}>
                        <div style={{display: 'flex', alignItems: 'center'}}>
                            <select className={Styles.DialogInput} placeholder="HH:MM" value={this.state.startTime} onChange={(event) => this.updateTimeHandler('start', event)}>
                                {hours.slice(0,hours.length-1).map(hour => <option key={hour.value} value={hour.value}>{hour.label}</option>)}
                            </select>
                            <span style={{padding: '0 20px'}}>to</span>
                            <select className={Styles.DialogInput} placeholder="HH:MM" value={this.state.endTime} onChange={(event) => this.updateTimeHandler('end', event)}>
                            {hours.filter(hour => hour.value > this.state.startTime).map(hour => <option key={hour.value} value={hour.value}>{hour.label}</option>)}
                            </select>
                        </div>
                        {this.state.newSlotError ? <div className={Styles.DialogError}>{this.state.newSlotError}</div> : null}
                    </div>
                    <div className={Styles.actions}>
                        <button
                            className={['quip-button-primary', Styles.PrimaryButton].join(' ')}
                            disabled={this.state.newSlotError}
                            onClick={this.createSlotHandler} >
                            <Icon type="forward" width={15} height={15} />
                        </button>
                    </div>
                </div>
            </Dialog>;
        }

        let deleteButton;
        if (editable && dayConfiguration.timestamp != 0) {
            deleteButton = <div style={{backgroundColor: quip.apps.ui.ColorMap.RED.VALUE}} onClick={this.openDateDelete} className={Styles.BottomButton}>
                <Icon type="close" color="#FFFFFF" width={20} height={20} />
            </div>;
        }

        let deleteDayDialog;
        if (this.state.deletingDay) {
            deleteDayDialog = <Dialog onDismiss={this.dismissDateDelete}>
            <div className={Styles.dialog}>
                <div className={Styles.header}>
                    {quiptext("Delete Entire Day")}
                </div>
                <div className={Styles.picker} style={{ minHeight: 'auto', padding: '0px 40px 20px 40px', alignItems: 'center' }}>
                    <span style={{minWidth: '200px'}}>Are you sure you want to delete the entire day?<br /><br />
                    All slots and related responses will be lost.</span>
                </div>
                <div className={Styles.actions}>
                    <quip.apps.ui.Button
                        text={quiptext("Cancel")}
                        onClick={this.dismissDateDelete} />
                    <quip.apps.ui.Button
                        primary={true}
                        text={quiptext("Delete")}
                        onClick={() => this.props.deleteDate(dayConfiguration.timestamp)} />
                </div>
            </div>
        </Dialog>;
        }

        const styles = [
            Styles.DayColumnWrapper
        ];
        let slotButton;

        if (dayConfiguration.timestamp == 0) {
            styles.push(Styles.EmptyDay);
        } else {
            if (this.state.pulsing) {
                styles.push(Styles.AnimateColumn);
            }
            slotButton = <div style={{position: 'relative'}}>
                {dayConfiguration.timestamp > 0 && dayConfiguration.timeslots.length == 0 ? <div className={Styles.Arrow}>
                    <Icon type="arrowdown" width={32} height={32} color={quip.apps.ui.ColorMap.BLUE.VALUE} />
                </div> : null}
                <div style={{backgroundColor: quip.apps.ui.ColorMap.BLUE.VALUE}} onClick={this.showNewSlotPickerHandler} className={Styles.BottomButton}>
                    <Icon type="add" color="#FFFFFF" width={20} height={20} />
                </div>
            </div>;
        }

        let bottomButtonStyles = [Styles.BottomButtons];

        if (this.props.isMobile) {
            styles.push(Styles.Mobile);
            bottomButtonStyles.push(Styles.Mobile);
        }

    
        return <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
            <div className={styles.join(' ')} style={{justifyContent: dayConfiguration.timeslots.length == 0 ? 'center' : null}}>
                {prettyDay}
                {slotsBlock}
            </div>
            {editable ? <div className={bottomButtonStyles.join(' ')}>
                {deleteButton}
                {slotButton}
            </div> : null }
            {editable ? datePicker : null}
            {editable ? newSlotPicker : null}
            {deleteDayDialog}
        </div>;
    }
    
};

export default Day;