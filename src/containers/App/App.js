import React, { Component } from 'react';
import Styles from "./App.less";

import Scheduler from '../../components/Scheduler/Scheduler';

class App extends Component {

    state = {
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
        ]
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

    render() {
        console.log('Render');

        return <div>
            <Scheduler days={this.state.days} onDeleteDay={this.deleteDayHandler} />
            <button onClick={this.newSessionHandler}>Add New Session</button>
        </div>;
    }
}

export default App;
