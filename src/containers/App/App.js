import React, { Component } from 'react';
import moment from 'moment';

import ExternalCalendars from '../../externalCalendars';
import Scheduler from '../../components/Scheduler/Scheduler';

import Styles from "./App.less";

const externalCalendars = new ExternalCalendars();

export default class App extends Component {

    state = {
        record: null,
        containerWidth: 800,
        dates: [],
        calendarLogin: false
    }

    componentDidMount() {
        this.updateContainerWidth();
        this.updateDates();
        this.updateCalendarState();

        this.setState({
            record: this.props.record
        });

        // Start listening for updates from other users/devices
        this.props.record.listen(this.remoteUpdateHandler);

        const timeslots = this.props.record.get('timeSlots');
        if (timeslots) {
            timeslots.listen(this.remoteUpdateHandler);
        }

        quip.apps.addEventListener(quip.apps.EventType.CONTAINER_SIZE_UPDATE, this.updateContainerWidth);
    }

    componentWillUnmount() {
        // Stop listening for updates from other users/devices
        this.props.record.unlisten(this.remoteUpdateHandler);

        const timeslots = this.props.record.get('timeSlots');
        if (timeslots) {
            timeslots.listen(this.remoteUpdateHandler);
        }

        quip.apps.removeEventListener(quip.apps.EventType.CONTAINER_SIZE_UPDATE, this.updateContainerWidth);
    }

    updateCalendarState = () => {
        this.setState({ calendarLogin: externalCalendars.isLoggedIn });
    }

    calendarLoginHandler = (providerName) => {
        return externalCalendars.login(providerName)
            .then(() => {
                this.updateCalendarState();
            })
            .catch(err => {
                console.log('Error while logging into calendar', err);
                this.updateCalendarState();
            });
    }

    calendarLogoutHandler = () => {
        return externalCalendars.logout()
            .then(() => {
                this.updateCalendarState();
            });
    }

    updateContainerWidth = () => {
        this.setState({ containerWidth: quip.apps.getContainerWidth() });
    }

    remoteUpdateHandler = () => {
        this.updateDates();
    }

    updateDates() {
        // Calculate days
        const editable = quip.apps.isDocumentEditable() && quip.apps.getViewingUser();

        let timeslots = [];
        if (this.props.record.has('timeSlots')) {
            timeslots = this.props.record.get('timeSlots').getRecords();
        }

        const startOfDays = [];
        let days = [];

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

        // Check if there are any empty dates locally
        // These are dates we're currently working on and shouldn't be deleted
        const emptyDates = this.state.dates.filter(date => date.timeslots.length == 0 && date.timestamp > 0);
        days.push(...emptyDates);
        
        days.sort((dateA, dateB) => {
            return dateA.timestamp - dateB.timestamp;
        });

        if (editable && !quip.apps.isMobile()) {
            if (days.length == 0) {
                days.push({
                    timestamp: 0,
                    configuring: true,
                    timeslots: []
                });
            } else {
                days.push({
                    timestamp: 0,
                    configuring: false,
                    timeslots: []
                });
            }
        }

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

                newDates.sort((dateA, dateB) => {
                    return dateA.timestamp - dateB.timestamp;
                });

                this.setState({
                    dates: newDates
                }, () => {
                    this.dismissDatePickerHandler(newTimestamp);
                });

            } else {
                this.setState({
                    dates: [...this.state.dates]
                }, () => {
                    this.dismissDatePickerHandler(oldTimestamp);
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

    deleteTimeslotHandler = (startOfDay, slotRecord) => {
        const myStartTime = slotRecord.get('startTime');
        const myEndTime = slotRecord.get('endTime');

        const myDateIndex = this.state.dates.findIndex(date => date.timestamp == startOfDay);
        if (myDateIndex > -1) {
            const myDate = this.state.dates[myDateIndex];
            const newTimeslots = myDate.timeslots.filter(slot => {
                const startTime = slot.get('startTime');
                const endTime = slot.get('endTime');

                return !(startTime == myStartTime && endTime == myEndTime);
            });

            const myNewDate = {
                ...myDate,
                timeslots: newTimeslots
            };

            const newDates = [...this.state.dates];
            newDates[myDateIndex] = myNewDate;

            slotRecord.delete();
            this.setState({
                dates: newDates
            });
        }
    }

    deleteDayHandler = (startOfDay) => {
        const dateToDelete = this.state.dates.find(date => date.timestamp == startOfDay);
        if (dateToDelete && dateToDelete.timeslots && dateToDelete.timeslots.length) {
            for (let timeslot of dateToDelete.timeslots) {
                this.deleteTimeslotHandler(startOfDay, timeslot);
            }
        }

        const newDates = this.state.dates.filter(date => date.timestamp != startOfDay);

        this.setState({
            dates: newDates
        });
    }

    checkIfDateExists = (startOfDay) => {
        return this.state.dates.find(d => d.timestamp == startOfDay);
    }

    checkCalendarAvailability = (startTime, endTime) => {
        return externalCalendars.checkAvailability(startTime, endTime);
    }

    render() {

        externalCalendars.updateMenu();

        return <div>
            <Scheduler
                days={this.state.dates}
                openDatePicker={this.openDatePickerHandler}
                dismissDatePicker={this.dismissDatePickerHandler}
                setNewDate={this.setDateHandler}
                deleteDate={this.deleteDayHandler}
                validateDate={this.checkIfDateExists}
                createTimeslot={this.createTimeslotHander}
                deleteTimeslot={this.deleteTimeslotHandler}
                containerWidth={this.state.containerWidth}
                calendarLogin={this.state.calendarLogin}
                checkCalendarAvailability={this.checkCalendarAvailability} />
        </div>;
    }
}