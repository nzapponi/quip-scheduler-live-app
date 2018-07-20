import React from 'react';

import Day from './Day/Day';
import Styles from './Scheduler.less';

const scheduler = (props) => {

    const days = props.days;
    
    let dayComponents = [];
    for (let day of days) {
        dayComponents.push(<Day
            key={day.timestamp}
            day={day}
            setNewDate={props.setNewDate}
            openDatePicker={props.openDatePicker}
            dismissDatePicker={props.dismissDatePicker} 
            createTimeslot={props.createTimeslot}
            deleteTimeslot={props.deleteTimeslot}
            deleteDate={props.deleteDate} />);
    }

    return <div className={Styles.SchedulerBox}>
        {dayComponents}
    </div>;
};

export default scheduler;