import React from 'react';
import moment from 'moment';

const slot = (props) => {
    const slot = props.slot;

    const startTime = moment(slot.get('startTime'));
    const endTime = moment(slot.get('endTime'));
    let responses = [];
    if (slot.has('responses')) {
        responses = slot.get('responses').getRecords();
    }

    return <p><b>Start</b>: {startTime.format('LT')}, <b>End</b>: {endTime.format('LT')}</p>;
};

export default slot;