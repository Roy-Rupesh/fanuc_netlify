import { ScrollArea } from "../../../@/components/ui/scroll-area";
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../@/components/ui/table";
import axios from "axios";
interface Alert {
  type: string;
  documentTs: number;
  machineName: string;
  message: string;
  timeTriggered: number;
  timeCleared?: number;
  timeElapsed: number;
  isTriggered: boolean;
  triggerCount: number;
}

export default function AlertTable() {
  const [data, setData] = useState<Alert[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get<{ data: Alert[] }>(
          "http://localhost:3000/v1/fanuc/alarms_messages"
        );
        setData(response.data.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();

    const intervalId = setInterval(fetchData, 60000);

    return () => clearInterval(intervalId);
  }, []);
  const formatTimestamp = (timestamp: string | number | Date) => {
    const date = new Date(timestamp);
    return date.toISOString().replace("T", " ").slice(0, 19);
  };

  return (
    <div>
      <ScrollArea className="h-72  rounded-md border">
        <Table className="w-[50px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Machine Name</TableHead>

              <TableHead>Time</TableHead>
              <TableHead>Message</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((alert) => (
              <TableRow key={alert.documentTs}>
                <TableCell>
                  {alert.machineName}{" "}
                  <span
                    className={
                      alert.type === "alarms"
                        ? "bg-red-500 text-white"
                        : alert.type === "messages"
                        ? "bg-yellow-500 text-black"
                        : "" // Add more conditions if needed
                    }
                  >
                    [{alert.type}]
                  </span>
                </TableCell>

                <TableCell className="text-sm message-cell">
                  {formatTimestamp(alert.timeTriggered)}
                </TableCell>
                <TableCell className="text-sm message-cell">
                  {alert.message}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}
