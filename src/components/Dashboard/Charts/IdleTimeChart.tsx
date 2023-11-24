import { useSelector } from "react-redux";
import { RootState } from "../../../redux/types";
import { useEffect, useState } from "react";
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

function OeeChart() {
  const [isLoading, setIsLoading] = useState(true);

  const baseInfo = useSelector((state: RootState) => state.app.baseInfo);

  useEffect(() => {
    if (baseInfo != null) {
      setIsLoading(false);
      console.log("base info", baseInfo);
    }
  }, [baseInfo]);

  // Function to format the timestamp
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
      const idel = payload[0].payload.idealTime; // Get the downtime value

      return (
        <div style={tooltipStyle}>
          <p style={{ marginTop: "0px", marginBottom: "1px" }}>
            {formatTimestamp(timestamp)}
          </p>
          <p style={{ margin: "0" }}>idealTime: {idel}</p>{" "}
          {/* Display downtime value */}
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      {isLoading ? (
        <div
          className="shimmer-container"
          style={{ width: "100%", height: 200 }}
        >
          <div className="shimmer"></div>
          <div className="lines"></div>
        </div>
      ) : (
        <ResponsiveContainer
          width="100%"
          // minHeight={300}
          // minWidth={500}
          //aspect={3}
          height={200}
        >
          <AreaChart
            width={400}
            height={300}
            data={baseInfo}
            margin={{
              top: 5,
              right: 60,
              left: 5,
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
            <Area
              type="monotone"
              dataKey="idealTime"
              stroke="#8884d8"
              fill="#8884d8"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default OeeChart;
