import { useDispatch, useSelector } from "react-redux";
import socket from "../../../socket.io";
import { RootState } from "../../../redux/types";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import config from "../../../config";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { format } from "date-fns";
import { utcToZonedTime } from "date-fns-tz";

import { setBaseInfo } from "../../../redux/reducers";

function AvgOeeChart() {
  const dispatch = useDispatch();
  const [AvgOeeData, setAvgOeeData] = useState<any[]>([]);
  const from = useSelector((state: RootState) => state.app.startDate);
  const to = useSelector((state: RootState) => state.app.endDate);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  useEffect(() => {
    if (from) {
      setStartDate(format(from, "yyyy-MM-dd'T'HH:mm:ss'Z'"));
    }
    if (to) {
      setEndDate(format(to, "yyyy-MM-dd'T'HH:mm:ss'Z'"));
    }
  }, [from, to]);

  const [averageOEEPercentage, setAverageOEEPercentage] =
    useState<string>("0.00");
  const userInput = useSelector((state: RootState) => state.app.userInput);

  const fetchProductionCountData = async () => {
    try {
      console.log("api called");
      const response = await axios.post(
        `${config.API_URL}/v1/controllerdata/allmachine`,
        {
          email: "dummy@gmail.com",
          password: "dummy12345",
          startDate: startDate,
          endDate: endDate,
          interval: userInput,
        }
      );
      const data = response.data.machineData;
      localStorage.setItem("oeeData", JSON.stringify(data));
      setAvgOeeData(data);
      console.log("avg eee", data);
      dispatch(setBaseInfo(data));

      const totalOEE = data.reduce(
        (sum: any, dataPoint: { OEE: any }) => sum + dataPoint.OEE,
        0
      );
      const averageOEE = (totalOEE / data.length).toFixed(2);
      setAverageOEEPercentage(averageOEE);
    } catch (error) {
      console.error("Error fetching production count data:", error);
    }
  };

  useEffect(() => {
    // fetchProductionCountData();
  }, [startDate, endDate, userInput]);

  useEffect(() => {
    const requestData = {
      startDate: startDate,
      endDate: endDate,
      interval: userInput,
    };
    socket.emit("allMachineOee", requestData);
  }, [startDate, endDate, userInput]);

  useEffect(() => {
    socket.on("allMachineOEE", (results) => {
      console.log("Received allMachineOEE data socket:", results);
      setAvgOeeData(results);
      const totalOEE = results.reduce(
        (sum: any, dataPoint: { OEE: any }) => sum + dataPoint.OEE,
        0
      );
      const averageOEE = (totalOEE / results.length).toFixed(2);
      setAverageOEEPercentage(averageOEE);
      dispatch(setBaseInfo(results));
    });
  }, [socket]);

  // useEffect(() => {
  //   const fetchData = () => {
  //     socket.emit("allMachineOee", {
  //       startDate,
  //       endDate,
  //       interval: userInput,
  //     });
  //   };

  //   // Polling function: Fetch data from the server every 5 seconds
  //   const pollingInterval = 1000;
  //   const pollingTimer = setInterval(fetchData, pollingInterval);

  //   fetchData();

  //   socket.on("allMachineOEE", (results) => {
  //     console.log("Received allMachineOEE data:", results);
  //     setAvgOeeData(results);
  //     dispatch(setBaseInfo(results));
  //   });

  //   // Cleanup the polling timer and event listener when the component unmounts
  //   return () => {
  //     clearInterval(pollingTimer);
  //     socket.off("allMachineOEE");
  //   };
  // }, [startDate, endDate, userInput]);

  function formatTimestamp(timestamp: string) {
    const date = new Date(timestamp); // Parse the timestamp string into a Date object
    // const timezone = "America/New_York"; // Replace with your desired timezone
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const zonedDate = utcToZonedTime(date, userTimezone); // Convert to the desired timezone
    return format(zonedDate, "yyyy-MM-dd h:mm a"); //"yyyy-MM-dd h:mm a"
  }
  function formatXAxis(timestamp: string) {
    const date = new Date(timestamp); // Parse the timestamp string into a Date object
    // const timezone = "America/New_York"; // Replace with your desired timezone
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const zonedDate = utcToZonedTime(date, userTimezone); // Convert to the desired timezone
    return format(zonedDate, "h:mm a"); //"yyyy-MM-dd h:mm a"
  }

  const tooltipStyle = {
    backgroundColor: "white",
    border: "1px solid #ccc",
    padding: "10px",
    borderRadius: "5px",
    boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.3)",
    height: "60px",
  };

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: any[];
  }) => {
    if (active && payload && payload.length) {
      const timestamp = payload[0].payload.hour;
      const OEE = payload[0].payload.OEE.toFixed(2); // Get the downtime value

      return (
        <div style={tooltipStyle}>
          <p style={{ marginTop: "0px", marginBottom: "1px" }}>
            {formatTimestamp(timestamp)}
          </p>
          <p style={{ margin: "0" }}>OEE: {OEE} %</p>{" "}
          {/* Display downtime value */}
        </div>
      );
    }
    return null;
  };

  return (
    <div
      style={{
        marginLeft: "10px",
        marginRight: "10px",
        marginTop: "10px",
        // height: "90px",
      }}
    >
      <h5 style={{ color: "gray" }}>Average OEE : {averageOEEPercentage} % </h5>

      <ResponsiveContainer width="100%" height={250}>
        <AreaChart
          width={400}
          height={300}
          data={AvgOeeData}
          margin={{
            top: 5,
            right: 30,
            left: 1,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="hour" tickFormatter={formatXAxis} /> <YAxis />
          <Tooltip
            content={({ active, payload }) => (
              <CustomTooltip active={active} payload={payload} />
            )}
          />
          <Legend />
          <Area type="monotone" dataKey="OEE" stroke="#8884d8" fill="#8884d8" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default AvgOeeChart;
