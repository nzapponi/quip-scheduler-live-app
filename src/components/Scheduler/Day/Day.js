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
        }
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
            }
        });
    }

    dismissNewSlotPicker = () => {
        
        this.setState({
            newSlotPicker: false
        });
    }

    render() {
        const dayConfiguration = this.props.day;
        const today = moment();
        const startOfToday = today.startOf('day');

        let datePicker;
        if (dayConfiguration.configuring) {
            datePicker = <Dialog onDismiss={() => this.props.dismissDatePicker(this.props.day.timestamp)} showBackdrop>
                <div style={{textAlign: 'center'}}>
                    <p>Pick a date...</p>
                </div>
                <quip.apps.ui.CalendarPicker
                    initialSelectedDateMs={this.props.day.timestamp > 0 ? this.props.day.timestamp : Date.now()}
                    onChangeSelectedDateMs={(newTime) => this.props.setNewDate(this.props.day.timestamp, newTime)}
                />
                
                <quip.apps.ui.Button
                    text="Schedule"
                    primary={true}
                    disabled={this.props.day.timestamp < startOfToday}
                    onClick={() => this.props.dismissDatePicker(this.props.day.timestamp)}
                />
            </Dialog>;
        }

        let slots = dayConfiguration.timeslots.map((slot) => {
            const key = slot.get('startTime') + '-' + slot.get('endTime');
            return <Slot key={key} slot={slot} />;
        });

        let prettyDay = <div>
            <p>Select date...</p>
        </div>;

        if (this.props.day.timestamp > 0) {
            const momentTime = moment(this.props.day.timestamp);
            prettyDay = <div>
                <p>{momentTime.format('ddd')}</p>
                <p>{momentTime.format('D')}</p>
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

                    </div>
                    <div className={Styles.actions}>
                        <quip.apps.ui.Button
                            text={quiptext("Cancel")}
                            onClick={this.dismissNewSlotPicker}/>
                        <quip.apps.ui.Button
                            primary={true}
                            // disabled={selectedObjectId === null}
                            text={quiptext("Save")}
                            onClick={this.dismissNewSlotPicker}/>
                    </div>
                </div>
            </Dialog>;
        }
    
        return <div>
            {prettyDay}
            {/* <button onClick={() => { this.props.onDelete(dayConfiguration.number) }}>Remove</button> */}
            <div className={Styles.DayColumn} onClick={this.showNewSlotPickerHandler}>
                {slots}
            </div>
            {datePicker}
            {newSlotPicker}
        </div>;
    }
    
};

export default Day;