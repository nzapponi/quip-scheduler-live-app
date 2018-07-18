import React, { Component } from 'react';
import moment from 'moment';
import Styles from "./App.less";

import Scheduler from '../../components/Scheduler/Scheduler';
import DateSelector from '../../components/DateSelector/DateSelector';

export default class App extends Component {

    state = {
        record: null,
        selectingDates: true,
        selectedDates: []
    }

    componentDidMount() {
        console.log('ComponentDidMount');
        this.setState({
            record: this.props.record
        });
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

    toggleSelectDatesHandler = () => {
        const currentState = this.state.selectingDates;

        this.setState({
            selectingDates: !currentState
        });
    }

    render() {
        // DOESN'T WORK: this.props.record.createdAt
        console.log(moment(this.props.record.get('createdAt')).format('L'));
        console.log(this.props.record);

        let component = <Scheduler days={[]} toggle={this.toggleSelectDatesHandler} />;
        if (this.state.selectingDates) {
            component = <DateSelector
                dates={this.state.selectedDates}
                onSetDate={this.setDateHandler}
                onDeleteDate={this.removeDateHandler}
                onComplete={this.toggleSelectDatesHandler} />;
        }

        return <div>
            {component}
        </div>;
    }
}