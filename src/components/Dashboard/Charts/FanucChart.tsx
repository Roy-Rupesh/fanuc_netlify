import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ComposedChart, Bar, XAxis, Tooltip, Rectangle } from "recharts";
import moment from "moment";
import { fetchFanucData } from "../../../redux/GanttReduces/fanucSlice";
import { RootState, AppDispatch } from "../../../redux/store";
import "../../../assets/css/FanucChart.css";

interface FanucChartProps {
  selectedHours: number;
  selectedMachine: string;
  chartWidth: number;
  timeTicks: number[]; // For common x-axis time scaling
  activeTooltipIndex: number | null; // For synchronized tooltips
  onMouseOver: (index: number) => void; // Mouse over handler
  onMouseOut: () => void; // Mouse out handler
  hoveredTime: number | null;
}

interface FanucData {
  time: number;
  run: number | null;
}

const processData = (data: FanucData[]): FanucData[] => {
  console.log("Raw Data:", data);

  const processedData = data.map((point, index) => {
    let newPoint = { ...point };
    
    // Check if the current point is the first one or if the run is not null
    if (index === 0 || newPoint.run !== null) {
      return newPoint;
    } else {
      // Set run to null if the current point is not the first and run is null
      newPoint.run = null;
      return newPoint;
    }
  });

  console.log("Processed Data:", processedData);
  return processedData;
};


// This function finds the first non-null state to use as the initial state
const findInitialState = (data: FanucData[]): number | null => {
  const firstNonNullData = data.find((d) => d.run !== null);
  return firstNonNullData ? firstNonNullData.run : null;
};

const SummaryTable: React.FC<{ chartData: FanucData[] }> = ({ chartData }) => {
  // const startTime =
  //   chartData.length > 0
  //     ? moment(chartData[0].time).format("DD/MM/YYYY HH:mm")
  //     : "-";
  // const endTime =
  //   chartData.length > 0
  //     ? moment(chartData[chartData.length - 1].time).format("DD/MM/YYYY HH:mm")
  //     : "-";

  const productiveTime =
    chartData.reduce((acc, curr) => acc + (curr.run === 3 ? 1 : 0), 0) * 60; // Convert to seconds
  const idleTime =
    chartData.reduce((acc, curr) => acc + (curr.run === 0 ? 1 : 0), 0) * 60; // Convert to seconds

  return (
    <table>
      <tbody>
        <tr>
          <td style={{ border: "1px solid #cccccc", fontSize: "smaller" }}>
            Total Productive Time: {productiveTime} secs
          </td>
          <td
            style={{
              textAlign: "right",
              border: "1px solid #cccccc",
              fontSize: "smaller",
            }}
          >
            Total Idle Time: {idleTime} secs
          </td>
        </tr>
      </tbody>
    </table>
  );
};

const FanucChart: React.FC<FanucChartProps> = ({
  selectedHours,
  selectedMachine,
  chartWidth,
  timeTicks,
  hoveredTime,
  onMouseOver,
  onMouseOut,
}) => {
  const dispatch: AppDispatch = useDispatch();
  const fanucData = useSelector(
    (state: RootState) => state.fanuc.data
  ) as FanucData[];
  console.log("Fanuc Data from Redux:", fanucData);

  // const [selectedMachine, setSelectedMachine] = useState<string>("datta_f2");
  // const [chartWidth, setChartWidth] = useState<number>(500);
  const [chartData, setChartData] = useState<FanucData[]>([]);

  const fetchData = useCallback(() => {
    dispatch(
      fetchFanucData({ hours: selectedHours, machine: selectedMachine })
    );
    // updateChartWidth();
  }, [dispatch, selectedHours, selectedMachine]);

  useEffect(() => {
    fetchData();
    // const interval = setInterval(fetchData, 60 * 1000);
    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Assume setActiveTooltipIndex is passed as a prop if it's not, then define it locally using useState
  const [activeTooltipIndex, setActiveTooltipIndex] = useState<number | null>(
    null
  );

  useEffect(() => {
    // Function to find index based on hoveredTime
    const findIndexBasedOnTime = (
      hoverTime: number | null,
      data: FanucData[]
    ): number | null => {
      if (hoverTime === null) return null;
      return data.findIndex((item) =>
        moment(item.time).isSame(moment(hoverTime), "minute")
      );
    };

    // Update the activeTooltipIndex based on hoveredTime
    setActiveTooltipIndex(findIndexBasedOnTime(hoveredTime, chartData));
  }, [hoveredTime, chartData]);

  useEffect(() => {
    console.log("Raw data from Redux store:", fanucData);
    const sortedFanucData = [...fanucData].sort((a, b) => a.time - b.time);
    const endDate = new Date();
    const startDate = moment(endDate).subtract(selectedHours, "hours").toDate();

    const placeholderData = generatePlaceholderData(startDate, endDate);
    const mergedData = mergeData(placeholderData, sortedFanucData); // Use sortedFanucData here

    const processedData = processData(mergedData);
    console.log("Processed data:", processedData);

    setChartData(processedData);
  }, [fanucData, selectedHours, chartWidth]);

  const generatePlaceholderData = (
    startDate: Date,
    endDate: Date
  ): FanucData[] => {
    const data: FanucData[] = [];
    let currentTime = startDate.getTime();

    while (currentTime <= endDate.getTime()) {
      data.push({
        time: currentTime,
        run: null,
      });
      currentTime += 60 * 1000; // 1 minute in milliseconds
    }

    return data;
  };

  const mergeData = (
    placeholderData: FanucData[],
    actualData: FanucData[]
  ): FanucData[] => {
    return placeholderData.map((point) => {
      const actualPoint = actualData.find((ap) =>
        moment(ap.time).isSame(moment(point.time), "minute")
      );
      return actualPoint || point;
    });
  };

  const barWidth = 8;

  const XAxisTickFormatter = (time: number): string => {
    return moment(time).format("HH:mm:ss");
  };

  const CustomBarShape = (props: any) => {
    const { x, y, width, height, value, index } = props;
    let color = value === 3 ? "green" : value === 0 ? "yellow" : "red";

    const adjustedX = x - 5;

    // Use useCallback to memorize the function to avoid unnecessary re-renders
    const handleMouseOver = useCallback(() => {
      props.onMouseOver(props.index);
    }, [props]);

    return (
      <Rectangle
        {...props}
        onMouseOver={handleMouseOver}
        onMouseOut={props.onMouseOut}
        x={adjustedX}
        y={50 - 50}
        width={barWidth + 5}
        height={30}
        fill={color}
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
  const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      let labelContent = "No Data";
  
      if (value === 3) {
        labelContent = "Productive";
      } else if (value === 0) {
        labelContent = "Idle";
      } else if (value === null) {
        labelContent = "No Data"; // explicitly handle null values
      }
  
      // Format the label (timestamp) using moment
      const time = moment(label).format("HH:mm:ss");
  
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
          >{`${labelContent} at ${time}`}</p>
        </div>
      );
    }
    return null;
  };
  const CustomTick = (props: any) => {
    // Adjust the appearance of the ticks as needed
    const { x, y, payload } = props;
  
    return (
      <g transform={`translate(${x},${y})`}>
        <line y2={5} stroke="#888" />
      </g>
    );
  };
  

  return (
    <div className="fanuc-chart-container">
      <h6>Machine-Uptime Data</h6>

      {chartData.length === 0 ? (
        <div className="no-data-message">
          Data is not available for this time period.
        </div>
      ) : (
        <>
          <ComposedChart
            width={chartWidth}
            height={35}
            data={chartData}
            margin={{ top: 1, right: 30, bottom: 1, left: 20 }}
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
              tickLine={false}
              tick={<CustomTick />}
            />
            
            <Tooltip
              content={<CustomTooltip />}
              active={activeTooltipIndex !== null}
              payload={
                activeTooltipIndex !== null &&
                activeTooltipIndex >= 0 &&
                activeTooltipIndex < chartData.length &&
                chartData[activeTooltipIndex].run !== null
                  ? [
                      {
                        name: "Run",
                        value: chartData[activeTooltipIndex].run as number,
                      },
                    ]
                  : []
              }
              labelFormatter={(label) => moment(label).format("HH:mm:ss")}
            />

            <Bar
              dataKey="run"
              fill="#8884d8"
              shape={
                <CustomBarShape
                  onMouseOver={onMouseOver}
                  onMouseOut={onMouseOut}
                />
              }
            />
          </ComposedChart>
        </>
      )}
      <SummaryTable chartData={chartData} />
      <ChartLegend />
    </div>
  );
};

export default FanucChart;