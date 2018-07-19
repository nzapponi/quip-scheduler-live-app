import React from 'react';

const slot = (props) => {
    const slot = props.slot;

    const startTime = slot.get('startTime');
    const endTime = slot.get('endTime');
    let responses = [];
    if (slot.has('responses')) {
        responses = slot.get('responses').getRecords();
    }

    return <p><b>Start</b>: {startTime}, <b>End</b>: {endTime}</p>;
};

export default slot;