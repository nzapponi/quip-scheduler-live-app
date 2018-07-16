import React from 'react';

const slot = (props) => {
    return <p><b>Start</b>: {props.slot.startTime}, <b>End</b>: {props.slot.endTime}</p>;
};

export default slot;