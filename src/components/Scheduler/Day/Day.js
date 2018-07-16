import React from 'react';

import Slot from './Slot/Slot';

const day = (props) => {
    
    const dayConfiguration = props.day;

    let slots = dayConfiguration.slots.map((slot, index) => {
        return <Slot key={index} slot={slot} />;
    });

    return <div>
        <p>{dayConfiguration.number}</p>
        <button onClick={() => { props.onDelete(dayConfiguration.number) }}>Remove</button>
        {slots}
    </div>;
};

export default day;