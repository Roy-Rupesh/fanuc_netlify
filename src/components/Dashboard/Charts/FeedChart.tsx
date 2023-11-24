import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ComposedChart, Bar, XAxis, Tooltip, Rectangle } from "recharts";
import { fetchFeedData } from "../../../redux/GanttReduces/feedSlice";
import { RootState, AppDispatch } from "../../../redux/store";
import "../../../assets/css/FeedChart.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGreaterThan } from '@fortawesome/free-solid-svg-icons';
interface FeedChartProps {
  selectedHours: number;
  selectedMachine: string;
  chartWidth: number;
  timeTicks: number[];
  activeTooltipIndex: number | null;
  onMouseOver: (index: number) => void;
  onMouseOut: () => void;
}

const CustomLegend = () => {
  return (
    <div className="custom-legend">
      <div className="legend-item">
        <div
          className="color-box"
          style={{ backgroundColor: "rgba(255, 255, 0)" }}
        ></div>
        <span>0</span>
      </div>
      <div className="legend-item">
        <div
          className="color-box"
          style={{ backgroundColor: "rgba(0, 128, 0)" }}
        ></div>
        <span>100</span>
      </div>
      <div className="legend-item">
        <div
          className="color-box"
          style={{ backgroundColor: "rgba(255, 0, 0)" }}
        ></div>
        <FontAwesomeIcon icon={faGreaterThan} />
        <span>100</span>
      </div>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const speed = payload[0].value;
    const time = formatToHoursMinutes(label);

    return (
      <div className="custom-tooltip">
        <p className="speed-value">{`Speed: ${speed}`}</p>
        <p className="time-value">{`Time: ${time}`}</p>
      </div>
    );
  }
  return null;
};

const formatToHoursMinutes = (timestamp: number) => {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};
const getColor = (value: number | null) => {
  if (value === null || value === undefined) {
    return "grey"; // Color for undefined or null values
  }

  if (value <= 75) {
    return "rgba(255, 255, 0)"; // Yellow for values between 0-75
  } else if (value <= 100) {
    return "rgba(0, 128, 0)"; // Green for values between 76-100
  } else {
    return "rgba(255, 0, 0)"; // Red for values above 100
  }
};

const FeedChart: React.FC<FeedChartProps> = ({
  selectedHours,
  selectedMachine,
  chartWidth,
  timeTicks,
  activeTooltipIndex, // Make sure this prop is passed down from the parent
  onMouseOver, // Make sure this prop is passed down from the parent
  onMouseOut,
}) => {
  const dispatch: AppDispatch = useDispatch();
  const feedData = useSelector((state: RootState) => state.feed.data);
  const [chartData, setChartData] = useState<any[]>([]);

  const minBarWidth = 8;
  const calculatedBarWidth = chartWidth / (chartData.length || 1);
  const barWidth = Math.max(minBarWidth, calculatedBarWidth);

  const fetchData = useCallback(() => {
    dispatch(fetchFeedData({ hours: selectedHours, machine: selectedMachine }));
  }, [dispatch, selectedHours, selectedMachine]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60 * 1000); // Fetch data every 60 seconds
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    const placeholderData = generatePlaceholderData(selectedHours);
    const mergedData = mergeData(placeholderData, feedData);
    setChartData(mergedData);
  }, [feedData, selectedHours]);

  const generatePlaceholderData = (selectedHours: number) => {
    const endDate = new Date().getTime();
    const startDate = endDate - selectedHours * 60 * 60 * 1000;

    const data = [];
    for (let time = startDate; time <= endDate; time += 60 * 1000) {
      data.push({
        time,
        feed: null,
      });
    }

    return data;
  };

  const mergeData = (placeholderData: any[], actualData: any[]) => {
    let lastKnownValue: number | null = null;
  
    // Find the first non-null value to use as an initial value
    const firstNonNullData = actualData.find((d) => d.feed !== null);
    if (firstNonNullData) {
      lastKnownValue = firstNonNullData.feed;
    }
  
    return placeholderData.map((point) => {
      const actualPoint = actualData.find((ap) => {
        const placeholderTime = new Date(point.time).getTime();
        const actualTime = new Date(ap.time).getTime();
        return Math.abs(placeholderTime - actualTime) <= 60 * 1000; // within 1 minute
      });
  
      if (actualPoint) {
        lastKnownValue = actualPoint.feed;
        return {
          ...point,
          feed: actualPoint.feed,
        };
      } else if (lastKnownValue !== null) {
        // Carry over the last known value if current is null
        return {
          ...point,
          feed: lastKnownValue,
        };
      }
  
      return point; // If no data has been found yet, return the point as is
    });
  };
  

  const CustomBarShape = (props: any) => {
    const { x, width, value,index } = props;
    const color = getColor(value);
    const isFirstBar = index === 0;
    const isLastBar = index === chartData.length - 1;
    // Instead of a fixed radius, we make it conditional based on the position in the dataset
    let radius = [0, 0, 0, 0]; // Default: no radius

    if (chartData.length === 1) {
      radius = [10, 10, 10, 10]; // Apply radius to all corners if only one bar
    } else {
      if (isFirstBar) {
        radius = [10, 0, 0, 10]; // Left side rounded for the first bar
      } else if (isLastBar) {
        radius = [0, 10, 10, 0]; // Right side rounded for the last bar
      }
    }
    const adjustedX = x - 5;
    const adjustedWidth = width;
    const fixedHeight = 30;
    const adjustedY = 30 - fixedHeight;

    return (
      <Rectangle
        {...props}
        onMouseOver={() => onMouseOver(props.index)} // Make sure to pass the index of the bar
        onMouseOut={onMouseOut}
        x={adjustedX}
        y={adjustedY}
        width={adjustedWidth + 2}
        height={fixedHeight}
        fill={color}
        // radius={radius}
      />
    );
  };
  return (
    <div className="feed-chart-container">
      <h6>Feed-Data</h6>

      {chartData.length === 0 ? (
        <div className="no-data-message">
          Data is not available for this time period.
        </div>
      ) : (
        <>
          <ComposedChart
            width={chartWidth}
            height={40}
            data={chartData}
            margin={{ top: 1, right: 30, bottom: 0, left: 20 }}
            barSize={20}
            barGap={0}
            barCategoryGap={0}
            onMouseMove={(e) => {
              if (e.isTooltipActive && e.activeTooltipIndex !== undefined) {
                onMouseOver(e.activeTooltipIndex);
              }
            }}
            onMouseLeave={onMouseOut}
          >
            <XAxis
              dataKey="time"
              axisLine={false}
              tickFormatter={formatToHoursMinutes}
              tick={{ fontSize: 12 }}
              ticks={timeTicks}
            />

            <Tooltip
              content={<CustomTooltip />}
              active={activeTooltipIndex !== null}
              payload={
                activeTooltipIndex !== null &&
                activeTooltipIndex >= 0 &&
                activeTooltipIndex < chartData.length &&
                chartData[activeTooltipIndex].feed !== null
                  ? [
                      {
                        name: "Feed Speed",
                        value: chartData[activeTooltipIndex].feed as number, // You need to ensure this index is within the data array bounds
                      },
                    ]
                  : []
              }
              labelFormatter={(label) => formatToHoursMinutes(label)}
            />

            <Bar
              dataKey="feed"
              name="Feed Speed"
              barSize={barWidth}
              shape={<CustomBarShape />}
            />
          </ComposedChart>
          <CustomLegend />
        </>
      )}
    </div>
  );
};

export default FeedChart;