import React, { Component } from 'react';
import moment from 'moment';

import Slot from './Slot/Slot';
import Dialog from '../../dialog/dialog';

import Styles from './Day.less';

class Day extends Component {

    state = {
        newSlotPicker: false,
        startTime: {
            hour: null,
            minute: null
        },
        endTime: {
            hour: null,
            minute: null
        },
        startTimeInput: '',
        endTimeInput: ''
    }

    showNewSlotPickerHandler = (event) => {
        
        const columnPosition = event.target.getBoundingClientRect();
        const pctFromTop = (event.clientY - columnPosition.top) / columnPosition.height;
        const hour = Math.floor(pctFromTop * 24);

        this.setState({
            newSlotPicker: true,
            startTime: {
                hour: hour,
                minute: 0
            },
            endTime: {
                hour: hour + 1,
                minute: 0
            },
            startTimeInput: `${hour < 10 ? '0' + hour : hour}:00`,
            endTimeInput: `${hour + 1 < 10 ? '0' + (hour + 1) : (hour + 1)}:00`
        });
    }

    dismissNewSlotPicker = () => {
        
        this.setState({
            newSlotPicker: false
        });
    }

    updateTimeHandler = (type, event) => {

        const timeComponents = event.target.value.split(':');
        const hour = +timeComponents[0];
        const minute = +timeComponents[1];

        if (hour >= 0 && hour < 24 && minute >= 0 && minute < 60) {
            if (type === 'start') {
                this.setState({
                    startTime: {
                        hour: hour,
                        minute: minute
                    },
                    startTimeInput: event.target.value
                });
            } else if (type === 'end') {
                this.setState({
                    endTime: {
                        hour: hour,
                        minute: minute
                    },
                    endTimeInput: event.target.value
                });
            }
        }   
    }

    createSlotHandler = () => {
        // Create the new slot!

        const startTime = moment(this.props.day.timestamp);
        startTime.hour(this.state.startTime.hour);
        startTime.minute(this.state.startTime.minute);

        const endTime = moment(this.props.day.timestamp);
        endTime.hour(this.state.endTime.hour);
        endTime.minute(this.state.endTime.minute);

        console.log(startTime.format(), endTime.format());

        this.props.createTimeslot(this.props.day.timestamp, startTime.valueOf(), endTime.valueOf());
        this.dismissNewSlotPicker();
    }

    updateSlotHandler = () => {
        this.setState({});
    }

    render() {
        const dayConfiguration = this.props.day;
        const today = moment();
        const startOfToday = today.startOf('day');

        let datePicker;
        if (dayConfiguration.configuring) {
            datePicker = <Dialog onDismiss={() => this.props.dismissDatePicker(this.props.day.timestamp)} showBackdrop>
                <div className={Styles.dialog}>
                    <div className={Styles.header}>
                        {quiptext("Select a Date")}
                    </div>
                    <div className={Styles.picker} style={{padding: '20px 40px'}}>
                        <quip.apps.ui.CalendarPicker
                            initialSelectedDateMs={this.props.day.timestamp > 0 ? this.props.day.timestamp : Date.now()}
                            onChangeSelectedDateMs={(newTime) => this.props.setNewDate(this.props.day.timestamp, newTime)}
                        />
                    </div>
                    <div className={Styles.actions}>
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

        let slots = dayConfiguration.timeslots.sort((slotA, slotB) => {
            const timeA = slotA.get('startTime');
            const timeB = slotB.get('startTime');
            return timeA - timeB;
        }).map((slot) => {
            const key = slot.get('startTime') + '-' + slot.get('endTime');
            return <Slot key={key} startOfDay={dayConfiguration.timestamp} slot={slot} deleteTimeslot={this.props.deleteTimeslot} updateSlot={this.updateSlotHandler} />;
        });

        let prettyDay = <div onClick={() => this.props.openDatePicker(this.props.day.timestamp)}>
            <p>Select date...</p>
        </div>;

        let slotsBlock;

        if (this.props.day.timestamp > 0) {
            const momentTime = moment(this.props.day.timestamp);
            prettyDay = <div>
                <p>{momentTime.format('ddd')}</p>
                <p>{momentTime.format('D')}</p>
            </div>;

            slotsBlock = <div className={Styles.DayColumn} onClick={this.showNewSlotPickerHandler}>
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
                    <div className={Styles.picker}>
                        <label>Start Time</label>
                        <input type="text" placeholder="HH:MM" value={this.state.startTimeInput} onChange={(event) => this.updateTimeHandler('start', event)} />
                        <label>End Time</label>
                        <input type="text" placeholder="HH:MM" value={this.state.endTimeInput} onChange={(event) => this.updateTimeHandler('end', event)} />
                    </div>
                    <div className={Styles.actions}>
                        <quip.apps.ui.Button
                            text={quiptext("Cancel")}
                            onClick={this.dismissNewSlotPicker}/>
                        <quip.apps.ui.Button
                            primary={true}
                            // disabled={selectedObjectId === null}
                            text={quiptext("Save")}
                            onClick={this.createSlotHandler}/>
                    </div>
                </div>
            </Dialog>;
        }

        let deleteButton;
        if (dayConfiguration.timestamp != 0 && dayConfiguration.timeslots.length == 0) {
            deleteButton = <quip.apps.ui.Button
                text={quiptext("Delete day")}
                onClick={() => this.props.deleteDate(dayConfiguration.timestamp)} />;
        }
    
        return <div>
            {prettyDay}
            {/* <button onClick={() => { this.props.onDelete(dayConfiguration.number) }}>Remove</button> */}
            {slotsBlock}
            {datePicker}
            {newSlotPicker}
            {deleteButton}
        </div>;
    }
    
};

export default Day;