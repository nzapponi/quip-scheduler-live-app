import React from 'react';

import Day from './Day/Day';

const scheduler = (props) => {

    const days = props.days;
    
    let dayComponents = [];
    for (let day of days) {
        dayComponents.push(<Day key={day.number} day={day} onDelete={props.onDeleteDay} />);
    }

    return <div>
        {dayComponents}
    </div>;
};

export default scheduler;