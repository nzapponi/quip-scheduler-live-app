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
        this.updateDates();

        this.setState({
            record: this.props.record
        });
    }

    updateDates() {
        // Calculate days
        let timeslots = [];
        if (this.props.record.has('timeSlots')) {
            timeslots = this.props.record.get('timeSlots').getRecords();
        }

        const startOfDays = [];
        const days = [];

        for (let timeslot of timeslots) {
            let time = timeslot.get('startTime');
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

        days.push({
            timestamp: 0,
            configuring: false,
            timeslots: []
        });

        this.setState({
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

            const emptyDate = newDates.find(date => date.timestamp == 0);
            if (!emptyDate) {
                newDates.push({
                    timestamp: 0,
                    configuring: false,
                    timeslots: []
                });
            }

            this.setState({
                dates: newDates
            });
        }
    }

    openDatePickerHandler = (timestamp) => {
        const index = this.state.dates.findIndex(date => date.timestamp == timestamp);
        if (index > -1) {
            const day = this.state.dates[index];

            const newDay = {
                ...day,
                configuring: true
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

    createTimeslotHander = (startOfDay, startTime, endTime) => {
        const newTimeslot = this.props.record.get('timeSlots').add({
            startTime: startTime,
            endTime: endTime
        });

        const index = this.state.dates.findIndex(date => date.timestamp == startOfDay);
        
        if (index > -1) {
            const day = this.state.dates[index];

            const newDay = {
                ...day,
                timeslots: [
                    ...day.timeslots,
                    newTimeslot
                ]
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

        return <div>
            <Scheduler
                days={this.state.dates}
                openDatePicker={this.openDatePickerHandler}
                dismissDatePicker={this.dismissDatePickerHandler}
                setNewDate={this.setDateHandler}
                createTimeslot={this.createTimeslotHander} />
        </div>;
    }
}