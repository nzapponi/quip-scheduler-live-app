import React from 'react';

import Day from './Day/Day';
import Styles from './Scheduler.less';

const scheduler = (props) => {

    const days = props.days;
    const styles = [Styles.SchedulerBox];

    if (props.containerWidth < 800) {
        styles.push(Styles.Mobile);
    }
    
    let dayComponents = [];
    for (let day of days) {
        dayComponents.push(<Day
            key={day.timestamp}
            day={day}
            setNewDate={props.setNewDate}
            validateDate={props.validateDate}
            openDatePicker={props.openDatePicker}
            dismissDatePicker={props.dismissDatePicker} 
            createTimeslot={props.createTimeslot}
            deleteTimeslot={props.deleteTimeslot}
            deleteDate={props.deleteDate}
            isMobile={props.containerWidth < 800} />);
    }

    return <div className={styles.join(' ')} style={{width: props.containerWidth < 800 ? props.containerWidth : null}}>
        {dayComponents}
    </div>;
};

export default scheduler;