import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ComposedChart, Bar, XAxis, Tooltip, Rectangle } from "recharts";
import { fetchMotionData } from "../../../redux/GanttReduces/motionSlice";  // Assuming you have a motionSlice similar to fanucSlice
import { RootState, AppDispatch } from "../../../redux/store";
import "./MotionChart.css";  // Create a similar CSS file

const MotionChart: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const motionData = useSelector((state: RootState) => state.motion.data);
  console.log("Full motionData:", motionData);

  const [selectedDuration, setSelectedDuration] = React.useState<number | null>(
    null
  );
  const [selectedMachine, setSelectedMachine] =
    React.useState<string>("f_sim_mqtt_long");
  const [chartWidth, setChartWidth] = useState(780);

  const minBarWidth = 10;
  const maxAllowedBarWidth = 50;
  const barWidth = Math.min(
    maxAllowedBarWidth,
    chartWidth / (motionData.length || 1)
  );
  const adjustedWidth = chartWidth / motionData.length;

  const CustomBarShape = (props: any) => {
    const { x, value, index } = props;

    // Adjusted color logic for motion
    let color = value === 1 ? "green" : "yellow";

    const isFirstBar = index === 0;
    const isLastBar = index === motionData.length - 1;
    const radius = isFirstBar
      ? [10, 0, 0, 10]
      : isLastBar
      ? [0, 10, 10, 0]
      : [0, 0, 0, 0];
    const adjustedX = x + (barWidth - adjustedWidth) / 2;

    return (
      <Rectangle
        {...props}
        x={adjustedX}
        y={50 - 30}
        width={adjustedWidth + 3}
        height={30}
        fill={color}
        radius={radius}
      />
    );
  };

  const ChartLegend: React.FC = () => (
    <div className="chart-legend">
      <div className="legend-item">
        <div className="color-box" style={{ backgroundColor: "#4CAF50" }}></div>
        Productive
      </div>
      <div className="legend-item">
        <div className="color-box" style={{ backgroundColor: "#FFFF00" }}></div>
        Idle
      </div>
      <div className="legend-item">
        <div className="color-box" style={{ backgroundColor: "#FF0000" }}></div>
        No Data
      </div>
    </div>
  );

  // Debounce function to improve performance on resize
  function debounce(func: () => void, wait: number): () => void {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    return () => {
      const later = () => {
        timeout = null;
        func();
      };
      if (timeout !== null) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(later, wait);
    };
  }

  // Function to update chart width based on screen size
  const updateChartWidth = () => {
    const container = document.querySelector(".motion-chart-container");
    if (container) {
      const containerWidth = container.clientWidth; // No need to subtract 20
      setChartWidth(containerWidth);
    }
  };

  useEffect(() => {
    // Initial chart width
    updateChartWidth();

    // Update chart width when the window is resized
    const debouncedHandleResize = debounce(updateChartWidth, 50);
    window.addEventListener("resize", debouncedHandleResize);

    return () => {
      // Remove the event listener when the component unmounts
      window.removeEventListener("resize", debouncedHandleResize);
    };
  }, []);

  // Improved date formatter to ensure we don't get NaN
  const formatDate = (date: Date | null) => {
    if (!date) return "";
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  if (motionData.length > 0) {
    console.log("First observation.time:", motionData[0]["observation.time"]);
    console.log(
      "Parsed First Date:",
      formatDate(motionData[0]["observation.time"])
    );
    console.log(
      "Last observation.time:",
      motionData[motionData.length - 1]["observation.time"]
    );
    console.log(
      "Parsed Last Date:",
      formatDate(motionData[motionData.length - 1]["observation.time"])
    );
  }
  const startDate =
    motionData.length > 0 ? new Date(motionData[0].observation.time) : null;
  const endDate =
    motionData.length > 0
      ? new Date(motionData[motionData.length - 1].observation.time)
      : null;

  const formatToHoursMinutes = (dateString: string) => {
    const date = new Date(dateString);
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const period = hours >= 12 ? "PM" : "AM";
    const formattedHours = (((hours + 11) % 12) + 1)
      .toString()
      .padStart(2, "0");
    return `${formattedHours}:${minutes} ${period}`;
  };

  const CustomTooltip: React.FC<any> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      let label;
      if (payload[0].value === 1) {
        label = "Productive";
      } else {
        label = "Idle";
      }

      return (
        <div
          className="custom-tooltip"
          style={{
            backgroundColor: "#F5F5F5",
            color: "#333333",
            padding: "2px 5px",
            borderRadius: "5px",
            border: "1px solid #cccccc",
          }}
        >
          <p
            className="label"
            style={{ fontWeight: "bold", margin: 0 }}
          >{`${label}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="motion-chart-container">
      <h1>Spindle Motion Data</h1>

      <div className="button-container">
        <button
          onClick={() => {
            dispatch(fetchMotionData({ hours: 1, machine: selectedMachine }));
            setSelectedDuration(1);
          }}
          className={selectedDuration === 1 ? "selected" : ""}
        >
          Last 1 hour
        </button>
        <button
          onClick={() => {
            dispatch(fetchMotionData({ hours: 8, machine: selectedMachine }));
            setSelectedDuration(8);
          }}
          className={selectedDuration === 8 ? "selected" : ""}
        >
          Last 8 hours
        </button>
        <button
          onClick={() => {
            dispatch(fetchMotionData({ hours: 24, machine: selectedMachine }));
            setSelectedDuration(24);
          }}
          className={selectedDuration === 24 ? "selected" : ""}
        >
          Last 24 hours
        </button>
        <button
          onClick={() => {
            dispatch(fetchMotionData({ hours: 336, machine: selectedMachine }));
            setSelectedDuration(336);
          }}
          className={selectedDuration === 336 ? "selected" : ""}
        >
          Last week
        </button>
      </div>
      {motionData.length === 0 ? (
        <div className="no-data-message">
          Data is not available for this time period.
        </div>
      ) : (
        <>
          <ComposedChart
            width={chartWidth}
            height={100}
            data={motionData}
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            barSize={adjustedWidth}
            barGap={0}
            barCategoryGap={0}
          >
            <XAxis
              dataKey="observation.time"
              axisLine={false}
              tickFormatter={(time) =>
                formatToHoursMinutes(new Date(time).toISOString())
              }
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="state.data.motion"
              fill="#8884d8"
              barSize={barWidth}
              shape={CustomBarShape}
            />
          </ComposedChart>

          {startDate && endDate && (
            <div className="date-range">
              {startDate && endDate
                ? `Date Range: ${formatDate(startDate)} - ${formatDate(
                    endDate
                  )}`
                : null}
            </div>
          )}

          <ChartLegend />
        </>
      )}
    </div>
  );
};

export default MotionChart;