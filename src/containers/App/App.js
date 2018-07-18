import React, { Component } from 'react';
import moment from 'moment';
import Styles from "./App.less";

import Scheduler from '../../components/Scheduler/Scheduler';

export default class App extends Component {

    componentDidMount() {
        console.log('ComponentDidMount');
        this.setState({
            record: this.props.record
        });
    }

    state = {
        record: null,
        selectedDates: []
    }

    setDateHandler = (newDate) => {
        const currentDates = [...this.state.selectedDates];

        const today = moment();
        const startOfToday = today.startOf('day');

        if (currentDates.indexOf(newDate) == -1 && newDate >= startOfToday.valueOf()) {
            currentDates.push(newDate);

            this.props.record.set('createdAt', newDate.valueOf());

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
        // DOESN'T WORK: this.props.record.createdAt
        console.log(moment(this.props.record.get('createdAt')).format('L'));
        console.log(this.props.record);

        const selectedDates = this.state.selectedDates.sort().map(date => {
            const momentDate = moment(date);

            return <li key={date} onClick={() => this.removeDateHandler(date)}>{momentDate.format('L')}</li>;
        });

        return <div>
            <quip.apps.ui.CalendarPicker
                initialSelectedDateMs={Date.now()}
                onChangeSelectedDateMs={this.setDateHandler}
            />

            <p>Selected dates:</p>
            <ul>
                {selectedDates}
            </ul>
        </div>;
    }
}