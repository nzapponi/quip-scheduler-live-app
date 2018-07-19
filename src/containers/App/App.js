import React, { Component } from 'react';
import moment from 'moment';
import Styles from "./App.less";

import Scheduler from '../../components/Scheduler/Scheduler';

export default class App extends Component {

    state = {
        record: null,
        dates: []
    }

    componentDidMount() {
        console.log('ComponentDidMount');

        // Calculate days
        let timeslots = [];
        if (this.props.record.has('timeSlots')) {
            timeslots = this.props.record.get('timeSlots').getRecords();
        }

        const startOfDays = [];
        const days = [];

        for (let timeslot of timeslots) {
            let time = timeslot.get('time');
            let startOfDay = moment(time).startOf('day').valueOf();
            if (startOfDay >= moment().startOf('day')) {
                if (startOfDays.indexOf(startOfDay) == -1) {
                    startOfDays.push(startOfDay);

                    days.push({
                        timestamp: startOfDay,
                        configuring: false,
                        timeslots: [timeslot]
                    });
                } else {
                    let day = days.find(day => day.timestamp == startOfDay);
                    if (day) {
                        day.timeslots.push(timeslot);
                    }
                }
            }
        }

        if (days.length == 0) {
            days.push({
                timestamp: 0,
                configuring: true,
                timeslots: []
            });
        }

        this.setState({
            record: this.props.record,
            dates: days
        });
    }

    dismissDatePickerHandler = (timestamp) => {
        const index = this.state.dates.findIndex(date => date.timestamp == timestamp);
        if (index > -1) {
            const day = this.state.dates[index];

            const newDay = {
                ...day,
                configuring: false
            };

            const newDates = [...this.state.dates];
            newDates[index] = newDay;

            this.setState({
                dates: newDates
            });
        }
    }

    setDateHandler = (oldTimestamp, newTimestamp) => {
        const index = this.state.dates.findIndex(date => date.timestamp == oldTimestamp);
        if (index > -1) {
            const day = this.state.dates[index];

            // we need to update
            const today = moment();
            const startOfToday = today.startOf('day');

            if (newTimestamp >= startOfToday.valueOf()) {

                const newDay = {
                    ...day,
                    timestamp: newTimestamp
                };

                const newDates = [...this.state.dates];
                newDates[index] = newDay;

                this.setState({
                    dates: newDates
                });

            } else {
                this.setState({
                    dates: [...this.state.dates]
                });
            }

        }
    }

    // removeDateHandler = (date) => {
    //     // with splice
    //     const updatedDates = [...this.state.selectedDates];
    //     const indexToRemove = updatedDates.indexOf(date);
    //     updatedDates.splice(indexToRemove, 1);

    //     // with filter
    //     // const updatedDates = this.state.selectedDates.filter(d => {
    //     //     return d != date;
    //     // });

    //     this.setState({
    //         selectedDates: updatedDates
    //     });
    // }

    render() {

        // if (this.state.selectingDates) {
        //     component = <DateSelector
        //         dates={this.state.selectedDates}
        //         onSetDate={this.setDateHandler}
        //         onDeleteDate={this.removeDateHandler}
        //         onComplete={this.toggleSelectDatesHandler} />;
        // }

        return <div>
            <Scheduler
                days={this.state.dates}
                dismissDatePicker={this.dismissDatePickerHandler}
                setNewDate={this.setDateHandler} />
        </div>;
    }
}