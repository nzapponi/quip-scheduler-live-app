import React, { Component } from 'react';
import moment from 'moment';
import Styles from "./App.less";

import Scheduler from '../../components/Scheduler/Scheduler';

class App extends Component {

    componentDidMount() {
        console.log('ComponentDidMount');
        this.setState({
            record: this.props.record
        });
    }

    state = {
        record: null,
        days: [
            {
                number: '21',
                slots: [
                    {
                        startTime: '9am',
                        endTime: '11am'
                    },
                    {
                        startTime: '12pm',
                        endTime: '2pm'
                    }
                ]
            },
            {
                number: '23',
                slots: [
                    {
                        startTime: '9am',
                        endTime: '10am'
                    }
                ]
            }
        ],
        selectedDates: []
    }

    newSessionHandler = () => {
        const day = {...this.state.days[1]};
        const newSlots = [...day.slots];
        newSlots.push({
            startTime: '11am',
            endTime: '2pm'
        });
        day.slots = newSlots;

        const newDays = [...this.state.days];
        newDays[1] = day;
        
        this.setState({
            days: newDays
        });
    }

    deleteDayHandler = (dayNumber) => {
        const days = this.state.days;
        // const updatedDays = days.filter((day) => {
        //     return day.number != dayNumber;
        //     // if (day.number == dayNumber) {
        //     //     return false;
        //     // } else {
        //     //     return true;
        //     // }
        // });

        const updatedDays = days.filter(day => day.number != dayNumber);

        this.setState({
            days: updatedDays
        });
    }

    setDateHandler = (newDate) => {
        const currentDates = [...this.state.selectedDates];

        const today = moment();
        const startOfToday = today.startOf('day');

        if (currentDates.indexOf(newDate) == -1 && newDate >= startOfToday.valueOf()) {
            currentDates.push(newDate);

            this.setState({
                selectedDates: currentDates
            });
        }
    }

    removeDateHandler = (date) => {
        // with splice
        const updatedDates = [...this.state.selectedDates];
        const indexToRemove = updatedDates.indexOf(date);
        updatedDates.splice(indexToRemove, 1);

        // with filter
        // const updatedDates = this.state.selectedDates.filter(d => {
        //     return d != date;
        // });

        this.setState({
            selectedDates: updatedDates
        });
    }

    render() {
        console.log('Render');

        const record = this.props.record;
        // DOESN'T WORK: record.createdAt
        // const createdAt = record.get('createdAt');
        // console.log(createdAt);

        const selectedDates = this.state.selectedDates.sort().map(date => {
            const momentDate = moment(date);

            return <li key={date} onClick={() => this.removeDateHandler(date)}>{momentDate.format('L')}</li>;
        });

        return <div>
            <Scheduler days={this.state.days} onDeleteDay={this.deleteDayHandler} />
            <button onClick={this.newSessionHandler}>Add New Session</button>

            <quip.apps.ui.CalendarPicker
                initialSelectedDateMs={Date.now()}
                onChangeSelectedDateMs={this.setDateHandler}/>

            <p>Selected dates:</p>
            <ul>
                {selectedDates}
            </ul>
        </div>;
    }
}

export default App;
