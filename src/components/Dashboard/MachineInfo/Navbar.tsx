import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useDispatch } from "react-redux";
// import { setWidgetStartDate, setWidgetEndDate } from "../../../redux/reducers";
import PdfGenerator from "../../Reports/PdfGenerator";

const Navbar = () => {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [startDate, setStartDate] = useState<Date | null>(twentyFourHoursAgo);
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const dispatch = useDispatch();

  const handleStartDateChange = (date: Date | null) => {
    if (date) {
      const utcDate = new Date(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        date.getUTCHours(),
        date.getUTCMinutes()
      );
      setStartDate(utcDate);
      // dispatch(setWidgetStartDate(utcDate));
    } else {
      setStartDate(null);
      // dispatch(setWidgetStartDate(null));
    }
  };

  const handleEndDateChange = (date: Date | null) => {
    if (date) {
      const utcDate = new Date(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        date.getUTCHours(),
        date.getUTCMinutes()
      );
      setEndDate(utcDate);
      // dispatch(setWidgetEndDate(utcDate));
    } else {
      setEndDate(null);
      // dispatch(setWidgetEndDate(null));
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="collapse navbar-collapse" id="navbarNav">
        <DatePicker
          selected={startDate}
          onChange={(date) => handleStartDateChange(date)}
          showTimeSelect
          dateFormat="yyyy-MM-dd HH:mm"
          timeFormat="HH:mm"
          timeIntervals={15}
          placeholderText="Select start time"
        />

        <DatePicker
          selected={endDate}
          onChange={(date) => handleEndDateChange(date)}
          showTimeSelect
          dateFormat="yyyy-MM-dd HH:mm"
          timeFormat="HH:mm"
          timeIntervals={15}
          placeholderText="Select end time"
        />
      </div>
      <PdfGenerator />
    </nav>
  );
};

export default Navbar;
