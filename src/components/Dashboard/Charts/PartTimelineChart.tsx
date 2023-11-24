import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ComposedChart,
  Bar,
  XAxis,
  Tooltip,
  Rectangle,
  ResponsiveContainer,
  Legend,
} from "recharts";
import moment from "moment";
import { fetchPartTimelineData } from "../../../redux/GanttReduces/partTimelineSlice";
import { RootState, AppDispatch } from "../../../redux/store";
import "../../../assets/css/PartTimelineChart.css";

interface PartTimelineChartProps {
  selectedHours: number;
  selectedMachine: string;
  chartWidth: number;
  timeTicks: number[];
  activeTooltipIndex: number | null;
  onMouseOver: (index: number) => void;
  onMouseOut: () => void;
  hoveredTime: number | null;
}
// const commentToColorMap: { [key: string]: string } = {
//   "(111-20-544 INNER FINN BTC)": "#008080",
//   "(CR-22-4NOS)": "#FF6B6B",
//   "(UB320)": "#007BFF",
//   default: "#B39DDB",
// };

interface ColorMap {
  [name: string]: string;
}

const getColorMap = (data: any[]): ColorMap => {
  const colors = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
    "#A55D35",
    "#D0B7B1",
    "#A58FAA",
    "#DDA0DD",
    "#5F9EA0",
  ]; // Add more colors if needed

  let colorMap: ColorMap = {}; // Define colorMap with ColorMap type
  data.forEach((item, index) => {
    const name = item.state.data.program.current.name;
    if (!colorMap[name]) {
      colorMap[name] = colors[index % colors.length];
    }
  });
  return colorMap;
};

const PartTimelineChart: React.FC<PartTimelineChartProps> = ({
  selectedHours,
  selectedMachine,
  chartWidth,
  timeTicks,
  hoveredTime,
  activeTooltipIndex,
  onMouseOver,
  onMouseOut,
}) => {
  const dispatch: AppDispatch = useDispatch();
  const rawPartData = useSelector(
    (state: RootState) => state.partTimeline.data
  );
  const [mergedData, setMergedData] = useState<any[]>([]);
  const [colorMap, setColorMap] = useState<ColorMap>({});

  const endDate = useMemo(() => new Date(), []);
  const startDate = useMemo(
    () => moment(endDate).subtract(selectedHours, "hours").toDate(),
    [selectedHours, endDate]
  );

  const isHovered = (dataPointTime: number): boolean => {
    return hoveredTime === dataPointTime;
  };

  const fetchData = useCallback(() => {
    dispatch(
      fetchPartTimelineData({
        hours: selectedHours,
        machine: selectedMachine,
        observationName: "production",
      })
    );
  }, [dispatch, selectedHours, selectedMachine]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60 * 1000); // Fetch data every 60 seconds
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    if (rawPartData) {
      // As setColorMap is a state-setting function, you should call it inside useEffect
      const updatedColorMap = getColorMap(rawPartData);
      setColorMap(updatedColorMap); // Set the new color map state
    }

    // The rest of your logic for placeholder and mergedData generation
    const placeholderData = generatePlaceholderData();
    const mergedDataWithColors = mergeData(placeholderData, rawPartData);
    setMergedData(mergedDataWithColors);
  }, [rawPartData, selectedHours, startDate, endDate]); // Make sure to include all dependencies

  const generatePlaceholderData = () => {
    const data = [];
    let currentTime = startDate;
    while (currentTime <= endDate) {
      // Adding 'UNAVAILABLE' or similar as a default name property
      data.push({
        observation: { time: currentTime.getTime() },
        state: {
          data: {
            program: { current: { name: "UNAVAILABLE", comment: "default" } },
          },
        },
      });
      currentTime = moment(currentTime).add(1, "minute").toDate();
    }
    return data;
  };

  const mergeData = (placeholderData: any[], actualData: any[]) => {
    return placeholderData.map((placeholder) => {
      const actualData = rawPartData.find((data) =>
        moment(data.observation.time).isSame(
          placeholder.observation.time,
          "minute"
        )
      );
      return actualData || placeholder;
    });
  };

  useEffect(() => {
    dispatch(
      fetchPartTimelineData({
        hours: selectedHours,
        machine: selectedMachine,
        observationName: "production",
      })
    );
  }, [dispatch, selectedMachine, selectedHours]);

  const formatToHoursMinutes = (timestamp: number) => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const CustomTooltip: React.FC<any> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const dataItem = payload[0].payload;
      // Check if the name exists or use "UNAVAILABLE" as a fallback
      const name = dataItem.state.data.program?.current?.name || "UNAVAILABLE";
      // You could also include a default comment or other property if you wish
      const comment =
        dataItem.state.data.program?.current?.comment || "No comment available";
      const fullDate = new Date(dataItem.observation.time);
      const formattedDate = fullDate.toLocaleDateString();
      const formattedTime = formatToHoursMinutes(dataItem.observation.time);
      return (
        <div className="custom-tooltip">
          <p className="label">{`Part-Name: ${name}`}</p>
          <p className="label">{`Date: ${formattedDate}`}</p>
          <p className="label">{`Time: ${formattedTime}`}</p>
        </div>
      );
    }
    return null;
  };

  const CustomBarShape: React.FC<any> = (props) => {
    const { fill, x, width, name, index, totalBars } = props;
    // const fillColor =
    //   commentToColorMap[comment] || commentToColorMap["default"];

    const isFirstBar = index === 0;
    const isLastBar = index === totalBars - 1;

    // Define the bar radius based on position
    let radius = [0, 0, 0, 0]; // Default: no radius
    if (totalBars === 1) {
      radius = [10, 10, 10, 10];
    } else if (isFirstBar) {
      radius = [10, 0, 0, 10]; // Left side rounded for the first bar
    } else if (isLastBar) {
      radius = [0, 10, 10, 0]; // Right side rounded for the last bar
    }
    const adjustedWidth = width + 10;
    const adjustedX = x - 3;

    return (
      <Rectangle
        {...props}
        x={adjustedX}
        y={5}
        width={adjustedWidth}
        height={30}
        fill={fill}
        // radius={radius}
      />
    );
  };

  // const ChartLegend: React.FC = () => (
  //   <div className="chart-legend">
  //     {Object.keys(commentToColorMap).map((comment) => (
  //       <div key={comment} className="legend-item">
  //         <div
  //           className="color-box"
  //           style={{ backgroundColor: commentToColorMap[comment] }}
  //         ></div>
  //         {comment}
  //       </div>
  //     ))}
  //   </div>
  // );
  const CustomLegend = () => (
    <div className="custom-legend">
      {Object.entries(colorMap).map(([name, color]) => (
        <div key={name} className="legend-item">
          <span
            className="legend-color-box"
            style={{ background: color, display: 'inline-block', width: '10px', height: '10px', marginRight: '5px' }}
          ></span>
          <span className="legend-text" style={{ fontSize: '9px' }}>{name}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="part-timeline-chart-container">
      <h6>Part-Name Data</h6>
      {mergedData.length === 0 ? (
        <div className="no-data-message">
          Data is not available for this time period.
        </div>
      ) : (
        <>
          <div style={{ width: chartWidth, height: "100%" }}>
            <ResponsiveContainer width="98%" height={35}>
              <ComposedChart
                data={mergedData}
                margin={{ top: 1, right: 20, bottom: 0, left: 20 }}
              >
                {/* <XAxis
                dataKey="observation.time"
                scale="time"
                type="number"
                  axisLine={false}
                domain={[startDate.getTime(), endDate.getTime()]} // Set the domain according to the time range
                ticks={timeTicks}
                tickFormatter={formatToHoursMinutes}
                tick={{ fontSize: 10 }}
              /> */}

                <Tooltip
                  content={<CustomTooltip />}
                  active={activeTooltipIndex !== null ? true : undefined}
                  cursor={{ fill: "transparent" }} // To avoid the default highlight box when hovering over bars
                />

                <Bar
                  dataKey="state.data.program.current.name"
                  shape={(props) => (
                    <CustomBarShape
                      {...props}
                      fill={
                        colorMap[
                          props.payload.state.data.program.current.name
                        ] || "#d38181"
                      }
                      totalBars={mergedData.length}
                      onMouseOver={() => onMouseOver(props.index)}
                      onMouseOut={onMouseOut}
                    />
                  )}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
        <CustomLegend />
    </div>
  );
};

export default PartTimelineChart;