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
export default function PortCountChart() {
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
    return format(zonedDate, "h:mm a");
  }
  const tableContainerStyle = {
    marginLeft: "900px",
  };
  return (
    <div className="d-none d-lg-block align-items-start">
      {isLoading ? (
        <div
          className="shimmer-container"
          style={{ width: "100%", height: 200 }}
        >
          <div className="shimmer"></div>
          <div className="lines"></div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
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
            <XAxis dataKey="hour" tickFormatter={formatTimestamp} /> <YAxis />
            <Tooltip />
            <Legend />
            <Area
              type="monotone"
              dataKey="productionTime"
              stroke="#8884d8"
              fill="#8884d8"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
