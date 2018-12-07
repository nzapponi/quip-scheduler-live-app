import React from 'react';

import Day from './Day/Day';
import Styles from './Scheduler.less';

const scheduler = (props) => {

    const days = props.days;
    const styles = [Styles.SchedulerBox];

    if (quip.apps.isMobile()) {
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
            calendarLogin={props.calendarLogin}
            checkCalendarAvailability={props.checkCalendarAvailability}
            isMobile={quip.apps.isMobile()}
            uniqueUsers={props.uniqueUsers}
            updateUniqueUsers={props.updateUniqueUsers} />);
    }

    return <div className={styles.join(' ')} style={{width: quip.apps.isMobile() ? props.containerWidth : null}}>
        {dayComponents}
    </div>;
};

export default scheduler;