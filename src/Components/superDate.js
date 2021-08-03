import React from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

class SuperDate extends DatePicker {
    constructor(props) {
        super(props);
        this.state = {
        }
        
    }

    render() {
        const { startDate, endDate, setDates } = this.props;
        switch (this.props.mode) {
            case "combined":
                return (
                    <div className='date-selector'>
                        <DatePicker
                            selected={startDate}
                            onChange={dates => setDates(dates)}
                            startDate={startDate}
                            endDate={endDate}
                            selectsRange
                            inline
                        />
                    </div>
                )
            case "start":
                return (
                    <div className='date-selector'>
                        <div className="super-label">Start</div>
                        <DatePicker
                            selected={startDate}
                            onChange={date => setDates([date, endDate])}
                            selectsStart
                            startDate={startDate}
                            endDate={endDate}
                        />
                    </div>
                )
            case "end":
                return (
                    <div className='date-selector'>
                        <div className="super-label">End</div>
                        <DatePicker
                            selected={endDate}
                            onChange={date => setDates([startDate, date])}
                            selectsEnd
                            startDate={startDate}
                            endDate={endDate}
                            minDate={startDate}
                        />
                    </div>
                )
            default:
        }
    }
}

export default SuperDate;