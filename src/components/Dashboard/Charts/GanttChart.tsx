import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  BarChart,
  Bar,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
  Rectangle,
  Label,
  ResponsiveContainer,
} from "recharts";
import {
  fetchAllMachines,
  fetchMacIds,
  fetchProductionData,
  setRealTimeData,
} from "../../../redux/GanttReduces/ganttslice";
import { RootState, AppDispatch } from "../../../redux/store";
import { ProductionData } from "../../../redux/types";
import { io, Socket } from "socket.io-client";
import "./ganttchart.css";
import moment from "moment-timezone";
import "resize-observer-polyfill/dist/ResizeObserver.global";
import 'font-awesome/css/font-awesome.min.css';
import config from "../../../config";


type DataEntry = {
  name?: string;
  value: number;
  di1?: boolean;
  di2?: boolean;
  di5?: boolean;
  di6?: boolean;
  status?: number;
  dtm: string;
  isMissing?: boolean;
};

type MissingInterval = {
  start: Date;
  end: Date;
};

const CustomBarShape = (props: any) => {
  const { x, y, width, fill, payload } = props;

  const minAllowedBarWidth = 10;
  const maxAllowedBarWidth = 50;
  const adjustedWidth = Math.max(
    minAllowedBarWidth,
    Math.min(maxAllowedBarWidth, width)
  );
  const barHeight = 30;
  const adjustedY = y +45; // Reset this value

  return (
    <Rectangle
      x={x}
      y={adjustedY}
      width={adjustedWidth}
      height={barHeight}
      fill={fill}
    />
  );
};

const getColor = (entry: DataEntry): string => {
  if (entry.isMissing) return "red"; // Color missing data as red

  const { di1, di2, di5, di6 } = entry;
  if (di5 && di6) return "pastelgreen";
  if (di5 || di1) return "green";
  if (di6 || di2) return "#FF6961"; // Pastel Red
  if (!di1 && !di2 && !di5 && !di6) return "yellow";
  return "red";
};

const formatTickItem = (tickItem: string) => {
  const date = new Date(tickItem);
  return moment.tz(date, "UTC").format("h:mm:ss A");
};

const ChartLegend: React.FC = () => (
  <div className="chart-legend">
    <div className="legend-item">
      <div className="color-box" style={{ backgroundColor: "#4CAF50" }}></div>
      <span className="legend-label" style={{ color: "#000" }}>
        Production
      </span>
    </div>
    <div className="legend-item">
      <div className="color-box" style={{ backgroundColor: "yellow" }}></div>
      <span className="legend-label" style={{ color: "#000" }}>
        Idle
      </span>
    </div>
    <div className="legend-item">
      <div className="color-box" style={{ backgroundColor: "red" }}></div>
      <span className="legend-label" style={{ color: "#000" }}>
        Power Off
      </span>
    </div>
  </div>
);

const CustomTooltipContent: React.FC<any> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const entry = payload[0].payload; // Get the data of the hovered bar
    const time = formatTickItem(entry.dtm); // Convert datetime to desired format
    let status = "";

    switch (getColor(entry)) {
      case "green":
      case "pastelgreen":
        status = "Productive";
        break;
      case "yellow":
        status = "Idle";
        break;
      case "red":
        status = "Data Missing";
        break;
      case "#FF6961":
        status = "Power Off";
        break;
      default:
        status = "Unknown";
    }

    return (
      <div className="custom-tooltip">
        <p>{time}</p>
        <p>{status}</p>
      </div>
    );
  }

  return null;
};

const CustomXAxisTick: React.FC<{
  x?: number;
  y?: number;
  payload?: any;
  startTime?: string;
  endTime?: string;
}> = ({ x, y, payload, startTime, endTime }) => {
  const date = new Date(payload.value);
  const formattedTime = moment.tz(date, "UTC").format("h:mm:ss A");

  const isStartOrEndTime =
    payload.value === startTime || payload.value === endTime;
  const textColor = isStartOrEndTime ? "black" : "#666";

  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={16} textAnchor="middle" fill={textColor}>
        {formattedTime}
      </text>
    </g>
  );
};

const DefaultGanttChart: React.FC = () => {
  return (
      <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          position: "relative", 
          width: "100%", height: "175px"
      }}>
        
          <i id="gear1" className="fa fa-cog spin" style={{ position: 'absolute', left: 'calc(50% - 70px)' }}></i>
          <i id="gear2" className="fa fa-cog spin-back" style={{ position: 'absolute', left: '50%' }}></i>
          <i id="gear3" className="fa fa-cog spin" style={{ position: 'absolute', left: 'calc(50% + 70px)' }}></i>
          
          <div style={{ fontSize: "16px", color: "black", textAlign: "center" }}>
              Thanks for your patience...
          </div>
      </div>
  );
};


const getMissingIntervals = (
  data: DataEntry[],
  interval: number
): MissingInterval[] => {
  const missingIntervals: MissingInterval[] = [];
  for (let i = 1; i < data.length; i++) {
    const prevTime = new Date(data[i - 1].dtm).getTime();
    const currTime = new Date(data[i].dtm).getTime();
    if (currTime - prevTime > interval) {
      missingIntervals.push({
        start: new Date(prevTime + interval),
        end: new Date(currTime - interval),
      });
    }
  }
  return missingIntervals;
};

const GanttChart: React.FC<{ selectedHours: number }> = ({ selectedHours }) => {
  const dispatch: AppDispatch = useDispatch();
  const { productionData, allMachines, loading, error } = useSelector(
    (state: RootState) => state.gantt
  );

  const [selectedMachine, setSelectedMachine] = useState<any>(null);
  // const [selectedHours, setSelectedHours] = useState(1);
  const [totals, setTotals] = useState<{ productive: number; idle: number }>({
    productive: 0,
    idle: 0,
  });

  const currentTimeUTC = new Date().toISOString();
  const startTimeUTC = new Date(
    Date.now() - selectedHours * 60 * 60 * 1000
  ).toISOString();

  const [isDataLoaded, setDataLoaded] = useState<boolean>(false);
  const [intervalId, setIntervalId] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchAllMachines());
  }, [dispatch]);

  useEffect(() => {
    // This function will fetch data and it'll be called initially and with each interval tick.
    const fetchData = () => {
      if (selectedMachine) {
        const fetchMacId = async () => {
          try {
            const response = await fetch(
              `${config.API_URL}/v1/gateway/${selectedMachine.gatewayId}`
            );
            const data = await response.json();
            if (data && data.macId) {
              dispatch(
                fetchProductionData({ mac: data.macId, hours: selectedHours })
              );
            }
          } catch (error) {
            console.error("Error fetching macId:", error);
          } finally {
            setDataLoaded(true); // Data has been attempted to be loaded
          }
        };
        fetchMacId();
      }
    };

    // Call the fetchData function immediately to fetch data when the component mounts or when dependencies change.
    fetchData();

    // Set up the auto-refresh interval
    const id = setInterval(fetchData, 1 * 60 * 1000) as unknown as number;

    // Save the interval ID to state
    setIntervalId(id);

    return () => {
      // Clear the interval when the component unmounts or when dependencies change
      clearInterval(id);
    };
  }, [selectedMachine, selectedHours]); // Removed 'dispatch' from the dependencies because it's likely constant.

  const renderTotalCounts = () => {
    const startTimeDisplay =
      formattedData.length > 0
        ? moment.tz(formattedData[0].dtm, "UTC").format("MM/DD/YYYY, h:mm:ss A")
        : "N/A";

    const endTimeDisplay =
      formattedData.length > 0
        ? moment
            .tz(formattedData[formattedData.length - 1].dtm, "UTC")
            .format("MM/DD/YYYY, h:mm:ss A")
        : "N/A";

    return (
      <div
        className="total-counts"
        style={{
          backgroundColor: "#000",
          padding: "10px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div style={{ marginRight: "20px" }}>
          <div>
            <span style={{ color: "#FFF" }}>Start Time:</span>
            <span style={{ color: "#FFF", marginLeft: "5px" }}>
              {startTimeDisplay}
            </span>
          </div>
          <div>
            <span style={{ color: "#FFF" }}>End Time:</span>
            <span style={{ color: "#FFF", marginLeft: "5px" }}>
              {endTimeDisplay}
            </span>
          </div>
        </div>
        <div>
          <div>
            <span style={{ color: "#FFF" }}>Total Productive:</span>
            <span style={{ color: "#FFF", marginLeft: "5px" }}>
              {totals.productive} seconds
            </span>
          </div>
          <div>
            <span style={{ color: "#FFF" }}>Total Idle:</span>
            <span style={{ color: "#FFF", marginLeft: "5px" }}>
              {totals.idle} seconds
            </span>
          </div>
        </div>
      </div>
    );
  };

  const formattedData: DataEntry[] = productionData.map((d: any) => {
    const di1 = d.data.io.di1;
    const di2 = d.data.io.di2;
    const di5 = d.data.modbus.length > 0 ? d.data.modbus[0].di5 : undefined;
    const di6 = d.data.modbus.length > 0 ? d.data.modbus[0].di6 : undefined;

    return {
      name: d._id,
      value: 1,
      di1,
      di2,
      di5,
      di6,
      status: di1 !== undefined ? di1 : -1,
      dtm: d.data.dtm,
    };
  });

  const INTERVAL = 60 * 1000; // Assuming 1 minute interval for your data
  const missingIntervals = getMissingIntervals(formattedData, INTERVAL);

  missingIntervals.forEach((interval) => {
    let time = interval.start.getTime();
    while (time < interval.end.getTime()) {
      formattedData.push({
        dtm: new Date(time).toISOString(),
        isMissing: true,
        value: 1,
      });
      time += INTERVAL;
    }
  });

  // Sort the formattedData by time after inserting missing intervals
  formattedData.sort(
    (a, b) => new Date(a.dtm).getTime() - new Date(b.dtm).getTime()
  );

  useEffect(() => {
    let productiveCount = 0;
    let idleCount = 0;

    formattedData.forEach((entry) => {
      if (getColor(entry) === "green" || getColor(entry) === "pastelgreen") {
        productiveCount++;
      } else if (getColor(entry) === "yellow") {
        idleCount++;
      }
    });

    setTotals({ productive: productiveCount, idle: idleCount });
  }, [formattedData]); // Add formattedData as a dependency

  console.log("Start Time (1 hour ago): ", startTimeUTC);
  console.log("Current Time: ", currentTimeUTC);

  // Determine the actual start and end times from your data
  const actualStartTime =
    formattedData.length > 0 ? formattedData[0].dtm : currentTimeUTC;
  const actualEndTime =
    formattedData.length > 0
      ? formattedData[formattedData.length - 1].dtm
      : currentTimeUTC;

  console.log("Actual Start Time (data): ", actualStartTime);
  console.log("Actual End Time (data): ", actualEndTime);

  return (
    <div className="gantt-chart-container">
      <h4>Machine Uptime-Downtime</h4>
      <div className="chart-container" style={{ marginBottom: "20px" }}>
        <div className="dropdown-legend-container">
          <div className="dropdown-container">
            <span className="label">Machine:</span>
            <select
              value={selectedMachine?.machineId || ""}
              onChange={(e) => {
                const selected = allMachines.find(
                  (m) => m.machineId === e.target.value
                );
                setSelectedMachine(selected);
              }}
            >
              <option value="" disabled>
                Select a machine
              </option>
              {allMachines.map((machine) => (
                <option key={machine.machineId} value={machine.machineId}>
                  {machine.machineName}
                </option>
              ))}
            </select>
          </div>
        </div>
        {/* <div className="button-container">
          <button
            style={{ backgroundColor: selectedHours === 1 ? "green" : "grey" }}
            onClick={() => setSelectedHours(1)}
          >
            Last 1 hour
          </button>
          <button
            style={{ backgroundColor: selectedHours === 8 ? "green" : "grey" }}
            onClick={() => setSelectedHours(8)}
          >
            Last 8 hours
          </button>
          <button
            style={{ backgroundColor: selectedHours === 24 ? "green" : "grey" }}
            onClick={() => setSelectedHours(24)}
          >
            Last 24 hours
          </button>
        </div> */}
      </div>

      {loading || !isDataLoaded ? (
        <DefaultGanttChart />
      ) : formattedData.length === 0 ? (
        <div style={{ position: "relative", width: "100%", height: "60px" }}>
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              fontSize: "16px",
              color: "red",
              textAlign: "center",
            }}
          >
            Data is not available for this time period.
          </div>
        </div>
      ) : (
        <ResponsiveContainer width="95%" height={175}>
          <BarChart
            data={formattedData}
            margin={{ top: 20, right: 65, left: 65, bottom: 50 }}
            // Adjust the margins if needed
          >
            <XAxis
              dataKey="dtm"
              type="category"
              tickFormatter={formatTickItem}
              domain={[actualStartTime, actualEndTime]}
              ticks={[actualStartTime, actualEndTime]}
              tick={
                <CustomXAxisTick
                  startTime={actualStartTime}
                  endTime={actualEndTime}
                />
              }
            />

            <YAxis hide={true} />
            <Bar dataKey="value" shape={<CustomBarShape />} cursor="pointer">
              {formattedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry)} />
              ))}
            </Bar>

            <Tooltip content={<CustomTooltipContent />} />
          </BarChart>
        </ResponsiveContainer>
      )}
      {renderTotalCounts()}
      <div className="legend-container">
        <ChartLegend />
      </div>
    </div>
  );
};

export default GanttChart;

//=============================================================================================

// import React, { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   BarChart,
//   Bar,
//   Tooltip,
//   XAxis,
//   YAxis,
//   Cell,
//   Rectangle,
//   Label,
// } from "recharts";
// import {
//   fetchMacIds,
//   fetchProductionData,
//   setRealTimeData,
// } from "../redux/ganttslice";
// import { RootState, AppDispatch } from "../redux/store";
// import { ProductionData } from "../redux/types";
// import { io, Socket } from "socket.io-client";
// import "./ganttchart.css";
// import moment from "moment-timezone";

// const CustomBarShape = (props: any) => {
//   const { x, y, width, fill, payload } = props;

//   const minAllowedBarWidth = 10;
//   const maxAllowedBarWidth = 50;
//   const adjustedWidth = Math.max(
//     minAllowedBarWidth,
//     Math.min(maxAllowedBarWidth, width)
//   );
//   const barHeight = 70;
//   const adjustedY = y-40;  // Reset this value

//   return (
//     <Rectangle x={x} y={adjustedY} width={adjustedWidth} height={barHeight} fill={fill} />
//   );
// };

// const getColor = (entry: any): string => {
//   const { di1, di2, di5, di6 } = entry;

//   if (di5 && di6) return "pastelgreen"; // Make sure this is also a valid color or replace it with a valid one
//   if (di5 || di1) return "green";
//   if (di6 || di2) return "#FF6961";  // Pastel Red
//   if (!di1 && !di2 && !di5 && !di6) return "yellow";
//   return "red";
// };

// const formatTickItem = (tickItem: string) => {
//   const date = new Date(tickItem);
//   return moment.tz(date, "UTC").format("h:mm:ss A");
// };

// const ChartLegend: React.FC = () => (
//   <div className="chart-legend">
//     <div className="legend-item">
//       <div className="color-box" style={{ backgroundColor: "#4CAF50" }}></div>
//       <span className="legend-label" style={{ color: "#000" }}>
//         Production
//       </span>
//     </div>
//     <div className="legend-item">
//       <div className="color-box" style={{ backgroundColor: "yellow" }}></div>
//       <span className="legend-label" style={{ color: "#000" }}>
//         Idle
//       </span>
//     </div>
//     <div className="legend-item">
//       <div className="color-box" style={{ backgroundColor: "red" }}></div>
//       <span className="legend-label" style={{ color: "#000" }}>
//         Power Off
//       </span>
//     </div>
//   </div>
// );

// const CustomTooltipContent: React.FC<any> = ({ active, payload }) => {
//   if (active && payload && payload.length) {
//     const entry = payload[0].payload; // Get the data of the hovered bar
//     const time = formatTickItem(entry.dtm); // Convert datetime to desired format
//     let status = "";

//     switch (getColor(entry)) {
//       case "green":
//       case "pastelgreen":
//         status = "Productive";
//         break;
//       case "yellow":
//         status = "Idle";
//         break;
//       case "red":
//         status = "Data Missing";
//         break;
//       case "FF6961":
//         status = "Power Off";
//         break;
//       default:
//         status = "Unknown";
//     }

//     return (
//       <div className="custom-tooltip">
//         <p>{time}</p>
//         <p>{status}</p>
//       </div>
//     );
//   }

//   return null;
// };

// const CustomXAxisTick: React.FC<{
//   x?: number;
//   y?: number;
//   payload?: any;
//   startTime?: string;
//   endTime?: string;
// }> = ({ x, y, payload, startTime, endTime }) => {
//   const date = new Date(payload.value);
//   const formattedTime = moment.tz(date, "UTC").format("h:mm:ss A");

//   const isStartOrEndTime =
//     payload.value === startTime || payload.value === endTime;
//   const textColor = isStartOrEndTime ? "black" : "#666";

//   return (
//     <g transform={`translate(${x},${y})`}>
//       <text x={0} y={0} dy={16} textAnchor="middle" fill={textColor}>
//         {formattedTime}
//       </text>
//     </g>
//   );
// };

// const DefaultGanttChart: React.FC = () => (
//   <div style={{ position: "relative", width: "1100px", height: "60px" }}>
//     <BarChart
//       width={1100}
//       height={60}
//       data={[{ name: "", value: 1 }]}
//       margin={{ top: 5, right: 60, left: 50, bottom: 5 }}
//     >
//       <defs>
//         <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
//           <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
//           <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
//         </linearGradient>
//       </defs>
//       <XAxis dataKey="name" tick={{ fill: "#ccc" }} />
//       <YAxis hide={true} tickLine={false} />
//       <Bar dataKey="value" fill="url(#colorUv)" />
//     </BarChart>
//     <div
//       style={{
//         position: "absolute",
//         top: "50%",
//         left: "50%",
//         transform: "translate(-50%, -50%)",
//         fontSize: "16px",
//         color: "#aaa",
//         textAlign: "center",
//       }}
//     >
//       Loading data...
//     </div>
//   </div>
// );

// const GanttChart: React.FC = () => {
//   const dispatch: AppDispatch = useDispatch();
//   const { productionData, allMacIds, loading, error } = useSelector(
//     (state: RootState) => state.gantt
//   );

//   const [selectedMacId, setSelectedMacId] = useState<string>("");
//   const [selectedHours, setSelectedHours] = useState(1);

//   const [totals, setTotals] = useState<{ productive: number; idle: number }>({
//     productive: 0,
//     idle: 0,
//   });

//   const currentTimeUTC = new Date().toISOString();
//   const startTimeUTC = new Date(
//     Date.now() - selectedHours * 60 * 60 * 1000
//   ).toISOString();

//   useEffect(() => {
//     dispatch(fetchMacIds());
//   }, [dispatch]);

//   useEffect(() => {
//     if (allMacIds.length > 0) {
//       setSelectedMacId(allMacIds[0]);
//     }
//   }, [allMacIds]);

//   useEffect(() => {
//     if (selectedMacId) {
//       dispatch(
//         fetchProductionData({ mac: selectedMacId, hours: selectedHours })
//       );

//       const socket: Socket = io("http://localhost:3000");
//       socket.emit("fetchDataByTimeFrame", {
//         mac: selectedMacId,
//         hours: selectedHours,
//       });
//       socket.on("dataByTimeFrame", (data: any) => {
//         dispatch(setRealTimeData(data));
//       });
//       return () => {
//         socket.off("dataByTimeFrame");
//         socket.close();
//       };
//     }
//   }, [dispatch, selectedMacId, selectedHours]);

//   const renderTotalCounts = () => {
//     const startTimeDisplay =
//       formattedData.length > 0
//         ? moment.tz(formattedData[0].dtm, "UTC").format("MM/DD/YYYY, h:mm:ss A")
//         : "N/A";

//     const endTimeDisplay =
//       formattedData.length > 0
//         ? moment
//             .tz(formattedData[formattedData.length - 1].dtm, "UTC")
//             .format("MM/DD/YYYY, h:mm:ss A")
//         : "N/A";

//     return (
//       <div
//         className="total-counts"
//         style={{
//           backgroundColor: "#000",
//           padding: "10px",
//           display: "flex",
//           justifyContent: "space-between",
//         }}
//       >
//         <div style={{ marginRight: "20px" }}>
//           <div>
//             <span style={{ color: "#FFF" }}>Start Time:</span>
//             <span style={{ color: "#FFF", marginLeft: "5px" }}>
//               {startTimeDisplay}
//             </span>
//           </div>
//           <div>
//             <span style={{ color: "#FFF" }}>End Time:</span>
//             <span style={{ color: "#FFF", marginLeft: "5px" }}>
//               {endTimeDisplay}
//             </span>
//           </div>
//         </div>
//         <div>
//           <div>
//             <span style={{ color: "#FFF" }}>Total Productive:</span>
//             <span style={{ color: "#FFF", marginLeft: "5px" }}>
//               {totals.productive} seconds
//             </span>
//           </div>
//           <div>
//             <span style={{ color: "#FFF" }}>Total Idle:</span>
//             <span style={{ color: "#FFF", marginLeft: "5px" }}>
//               {totals.idle} seconds
//             </span>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   const formattedData = productionData.map((d: any) => {
//     const di1 = d.data.io.di1;
//     const di2 = d.data.io.di2;
//     const di5 = d.data.modbus.length > 0 ? d.data.modbus[0].di5 : undefined;
//     const di6 = d.data.modbus.length > 0 ? d.data.modbus[0].di6 : undefined;

//     return {
//       name: d._id,
//       value: 1,
//       di1,
//       di2,
//       di5,
//       di6,
//       status: di1 !== undefined ? di1 : -1,
//       dtm: d.data.dtm,
//     };
//   });

//   useEffect(() => {
//     let productiveCount = 0;
//     let idleCount = 0;

//     formattedData.forEach((entry) => {
//       if (getColor(entry) === "green" || getColor(entry) === "pastelgreen") {
//         productiveCount++;
//       } else if (getColor(entry) === "yellow") {
//         idleCount++;
//       }
//     });

//     setTotals({ productive: productiveCount, idle: idleCount });
//   }, [formattedData]);

//   //   useEffect(() => {
//   //     let productiveCount = 0;
//   //     let idleCount = 0;

//   //     formattedData.forEach((entry) => {
//   //       if (getColor(entry) === "green" || getColor(entry) === "pastelgreen") {
//   //         productiveCount += 60;  // Assuming each entry represents 1 minute
//   //       } else if (getColor(entry) === "yellow") {
//   //         idleCount += 60;  // Assuming each entry represents 1 minute
//   //       }
//   //     });

//   //     setTotals({ productive: productiveCount, idle: idleCount });
//   // }, [formattedData]);

//   console.log("Start Time (1 hour ago): ", startTimeUTC);
//   console.log("Current Time: ", currentTimeUTC);

//   // Determine the actual start and end times from your data
//   const actualStartTime =
//     formattedData.length > 0 ? formattedData[0].dtm : currentTimeUTC;
//   const actualEndTime =
//     formattedData.length > 0
//       ? formattedData[formattedData.length - 1].dtm
//       : currentTimeUTC;

//   console.log("Actual Start Time (data): ", actualStartTime);
//   console.log("Actual End Time (data): ", actualEndTime);

//   return (
//     <div className="gantt-chart-container">
//       <div className="chart-container">
//         <div className="dropdown-legend-container">
//           <div className="dropdown-container">
//             <span className="label">MAC ID:</span>
//             <select
//               value={selectedMacId}
//               onChange={(e) => setSelectedMacId(e.target.value)}
//             >
//               {allMacIds.map((macId) => (
//                 <option key={macId} value={macId}>
//                   {macId}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>
//         <div className="button-container">
//           <button
//             style={{ backgroundColor: selectedHours === 1 ? "green" : "grey" }}
//             onClick={() => setSelectedHours(1)}
//           >
//             Last 1 hour
//           </button>
//           <button
//             style={{ backgroundColor: selectedHours === 8 ? "green" : "grey" }}
//             onClick={() => setSelectedHours(8)}
//           >
//             Last 8 hours
//           </button>
//           <button
//             style={{ backgroundColor: selectedHours === 24 ? "green" : "grey" }}
//             onClick={() => setSelectedHours(24)}
//           >
//             Last 24 hours
//           </button>
//         </div>
//       </div>
//       {loading || formattedData.length === 0 ? (
//         <DefaultGanttChart />
//       ) : (
//         <BarChart
//         width={1100}
//         height={175}  // Adjust the height to accommodate the bars and the XAxis
//         data={formattedData}
//         margin={{ top: 20, right: 65, left: 65, bottom: 95 }}  // Adjust the margins if needed
//       >

//           <XAxis
//             dataKey="dtm"
//             type="category"
//             tickFormatter={formatTickItem}
//             domain={[actualStartTime, actualEndTime]}
//             ticks={[actualStartTime, actualEndTime]}
//             tick={
//               <CustomXAxisTick
//                 startTime={actualStartTime}
//                 endTime={actualEndTime}
//               />
//             }
//           />

//           <YAxis hide={true} />
//           <Bar dataKey="value" shape={<CustomBarShape />} cursor="pointer">
//             {formattedData.map((entry, index) => (
//               <Cell key={`cell-${index}`} fill={getColor(entry)} />
//             ))}
//           </Bar>

//           <Tooltip content={<CustomTooltipContent />} />
//         </BarChart>
//       )}
//       {renderTotalCounts()}
//       <div className="legend-container">
//         <ChartLegend />
//       </div>
//     </div>
//   );
// };

// export default GanttChart;
