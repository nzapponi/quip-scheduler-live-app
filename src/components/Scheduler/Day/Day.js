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
        pendingPulse: false,
        pulsing: false
    }

    componentDidMount() {
        if (this.props.day.timeslots.length == 0 && this.props.day.timestamp > 0) {
            this.setState({ pendingPulse: true });
        }
    }

    showNewSlotPickerHandler = () => {

        const startOfHour = moment(this.props.day.timestamp).hours(moment().hours()).minutes(0);
        const endTime = moment(this.props.day.timestamp).hours(moment().hours()).add(1, 'hours').minutes(0);

        this.setState({
            newSlotPicker: true,
            startTime: startOfHour.valueOf(),
            endTime: endTime.valueOf()
        });
    }

    dismissDatePicker = () => {
        this.props.dismissDatePicker(this.props.day.timestamp);
        if (this.state.pendingPulse) {
            this.setState({
                pendingPulse: false,
                pulsing: true
            });
        }
    }

    dismissNewSlotPicker = () => {
        
        this.setState({
            newSlotPicker: false
        });
    }

    updateTimeHandler = (type, event) => {

        const newStartTime = +event.target.value;

        if (type === 'start') {
            let newEndTime = this.state.endTime;
            if (newEndTime <= newStartTime) {
                newEndTime = newStartTime + 60*60*1000;
            }

            this.setState({
                startTime: newStartTime,
                endTime: newEndTime
            });
        } else if (type === 'end') {
            this.setState({
                endTime: newStartTime
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

    render() {
        const dayConfiguration = this.props.day;
        const today = moment();
        const startOfToday = today.startOf('day');

        const startOfDay = moment(dayConfiguration.timestamp).startOf('day');

        const hours = [];
        for (let i = 0; i < 24; i++) {
            let time = startOfDay.clone().hours(i).minutes(0);
            hours.push({
                label: time.format('LT'),
                value: time.valueOf()
            });

            let laterTime = time.clone().minutes(30);
            hours.push({
                label: laterTime.format('LT'),
                value: laterTime.valueOf()
            });
        }

        let datePicker;
        if (dayConfiguration.configuring) {
            datePicker = <Dialog onDismiss={this.dismissDatePicker} showBackdrop>
                <div className={Styles.dialog}>
                    <div className={Styles.header}>
                        {quiptext("Pick a Date")}
                    </div>
                    <div className={Styles.picker} style={{padding: '0 40px'}}>
                        <quip.apps.ui.CalendarPicker
                            initialSelectedDateMs={this.props.day.timestamp > 0 ? this.props.day.timestamp : Date.now()}
                            onChangeSelectedDateMs={(newTime) => this.props.setNewDate(this.props.day.timestamp, newTime)}
                        />
                    </div>
                    <div className={Styles.actions} style={{padding: '20px 0'}}>
                        <quip.apps.ui.Button
                            text="Schedule"
                            primary={true}
                            disabled={this.props.day.timestamp < startOfToday}
                            onClick={() => this.props.dismissDatePicker(this.props.day.timestamp)}
                        />
                    </div>
                </div>
            </Dialog>;
        }

        let slots = <div style={{color: quip.apps.ui.ColorMap.BLUE.VALUE, padding: '0px 20px', cursor: 'pointer'}} onClick={this.showNewSlotPickerHandler}>Start by adding a new time slot!</div>;

        if (dayConfiguration.timeslots.length > 0) {
            slots = dayConfiguration.timeslots.sort((slotA, slotB) => {
                const timeA = slotA.get('startTime');
                const timeB = slotB.get('startTime');
                return timeA - timeB;
            }).map((slot) => {
                const key = slot.get('startTime') + '-' + slot.get('endTime');
                return <Slot key={key} startOfDay={dayConfiguration.timestamp} slot={slot} deleteTimeslot={this.props.deleteTimeslot} updateSlot={this.updateSlotHandler} />;
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
                slotsBlockStyle = Styles.NewDayColumn;
            }

            slotsBlock = <div className={slotsBlockStyle}>
                {slots}
            </div>;
        }

        let newSlotPicker;
        if (this.state.newSlotPicker) {
            newSlotPicker = <Dialog onDismiss={this.dismissNewSlotPicker}>
                <div className={Styles.dialog}>
                    <div className={Styles.header}>
                        {quiptext("Select a Time")}
                    </div>
                    <div className={Styles.picker} style={{minHeight: 'auto', padding: '0px 40px 20px 40px', alignItems: 'center'}}>
                        <select className={Styles.DialogInput} placeholder="HH:MM" value={this.state.startTime} onChange={(event) => this.updateTimeHandler('start', event)}>
                            {hours.map(hour => <option key={hour.value} value={hour.value}>{hour.label}</option>)}
                        </select>
                        <span style={{padding: '0 20px'}}>to</span>
                        <select className={Styles.DialogInput} placeholder="HH:MM" value={this.state.endTime} onChange={(event) => this.updateTimeHandler('end', event)}>
                        {hours.filter(hour => hour.value > this.state.startTime).map(hour => <option key={hour.value} value={hour.value}>{hour.label}</option>)}
                        </select>
                    </div>
                    <div className={Styles.actions}>
                        <quip.apps.ui.Button
                            text={quiptext("Cancel")}
                            onClick={this.dismissNewSlotPicker}/>
                        <quip.apps.ui.Button
                            primary={true}
                            text={quiptext("Save")}
                            onClick={this.createSlotHandler}/>
                    </div>
                </div>
            </Dialog>;
        }

        let deleteButton;
        if (dayConfiguration.timestamp != 0 && dayConfiguration.timeslots.length == 0) {
            deleteButton = <div style={{backgroundColor: quip.apps.ui.ColorMap.RED.VALUE}} onClick={() => this.props.deleteDate(dayConfiguration.timestamp)} className={Styles.BottomButton}>
                <Icon type="close" color="#FFFFFF" width={20} height={20} />
            </div>;
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
    
        return <div style={{display: 'flex'}}>
            <div className={styles.join(' ')}>
                {prettyDay}
                {slotsBlock}
                <div className={Styles.BottomButtons}>
                    {deleteButton}
                    {slotButton}
                </div>
            </div>
            {datePicker}
            {newSlotPicker}
        </div>;
    }
    
};

export default Day;