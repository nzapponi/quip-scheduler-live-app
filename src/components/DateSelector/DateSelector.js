import react from 'react';
import moment from 'moment';

const dateSelector = (props) => {
    const selectedDates = props.dates.sort().map(date => {
        const momentDate = moment(date);
        return <li key={date} onClick={() => props.onDeleteDate(date)}>{momentDate.format('L')}</li>;
    });

    let buttonDisabled = false;
    if (selectedDates.length == 0) {
        buttonDisabled = true;
    }

    return <div>
        <h3>Select one or more dates:</h3>

        <quip.apps.ui.CalendarPicker
            initialSelectedDateMs={Date.now()}
            onChangeSelectedDateMs={props.onSetDate}
        />

        <p>Selected dates:</p>
        <ul>
            {selectedDates}
        </ul>

        <quip.apps.ui.Button
            text="Schedule"
            primary={true}
            disabled={buttonDisabled}
            onClick={props.onComplete}
        />
    </div>;
};

export default dateSelector;