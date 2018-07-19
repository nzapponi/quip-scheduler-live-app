import React from 'react';

import Day from './Day/Day';

const scheduler = (props) => {

    const days = props.days;
    
    let dayComponents = [];
    for (let day of days) {
        dayComponents.push(<Day
            key={day.timestamp}
            day={day}
            onDelete={props.onDeleteDay}
            setNewDate={props.setNewDate}
            openDatePicker={props.openDatePicker}
            dismissDatePicker={props.dismissDatePicker} 
            createTimeslot={props.createTimeslot} />);
    }

    return <div>
        {dayComponents}
    </div>;
};

export default scheduler;