import React from 'react';

import Day from './Day/Day';

const scheduler = (props) => {

    const days = props.days;
    
    let dayComponents = [];
    for (let day of days) {
        dayComponents.push(<Day key={day.number} day={day} onDelete={props.onDeleteDay} />);
    }

    return <div>
        <h3>Scheduler</h3>
        {dayComponents}

        <quip.apps.ui.Button
            text="Change Dates"
            primary={true}
            onClick={props.toggle}
        />
    </div>;
};

export default scheduler;