import React from "react";
import moment from "moment-timezone";
import "../../../assets/css/CommonTimeAxis.css";

interface CommonTimeAxisProps {
  timeTicks: number[];
  chartWidth: number;
  onHover: (time: number | null) => void; // Can be called with a number or null to clear the hover state
}

const CommonTimeAxis: React.FC<CommonTimeAxisProps> = ({
  timeTicks,
  chartWidth,
  onHover,
}) => {
  const tickInterval = chartWidth / timeTicks.length;
  const minimumTickMarkWidth = 30;
  const skipTicks = Math.ceil(minimumTickMarkWidth / tickInterval);

  return (
    <div
      className="time-axis-container"
      style={{ width: chartWidth, position: "relative" }}
    >
      <div
        className="time-axis-line"
        style={{
          position: "absolute",
          top: "10px",
          width: "100%",
          borderTop: "1px solid black",
          left: 0,
        }}
      ></div>
      {timeTicks.map((tick, index) => {
        if (index % skipTicks === 0) {
          const positionPercent = (index / timeTicks.length) * 100;
          return (
            <React.Fragment key={tick}>
              <div
                className="time-tick-label"
                style={{
                  left: `${positionPercent}%`,
                  position: "absolute",
                  top: "12px", // position below the line slightly
                }}
                onMouseOver={() => onHover(index)}
                onMouseOut={() => onHover(null)}
              >
                {moment(tick).format("HH:mm")}
              </div>
              <div
                className="time-tick-mark"
                style={{
                  left: `${positionPercent}%`,
                  position: "absolute",
                  top: "10px", // align with the axis line
                  width: "1px",
                  height: "5px", // tick mark height
                  backgroundColor: "black", // tick mark color
                }}
              />
            </React.Fragment>
          );
        }
        return null;
      })}
    </div>
  );
};

export default CommonTimeAxis;
