import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { format } from "date-fns";
import { RootState } from "../../../redux/types";
import { Link } from "react-router-dom";
import config from "../../../config";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../@/components/ui/table";
import { io } from "socket.io-client";
import axios from "axios";
import socket from "../../../socket.io";
import { ScrollArea } from "../../../@/components/ui/scroll-area";
// import socket from "../../../socket.io";

interface ProductionData {
  Name: string;
  total_count: number;
}
function ProductionCountTable() {
  const selectedOption = useSelector(
    (state: RootState) => state.app.selectedOption
  );
  const to = useSelector((state: RootState) => state.app.endDate);
  const [endDate, setEndDate] = useState<string>("");

  const [data, setData] = useState<any>([]);
  // const socket = io("${config.API_URL}");
  useEffect(() => {
    if (to) {
      setEndDate(format(to, "yyyy-MM-dd'T'HH:mm:ss'Z'"));
    }
  }, [to]);

  useEffect(() => {
    const fetchData = async () => {
      console.log(endDate); //2023-10-05T00:00:00Z
      try {
        const response = await axios.post(
          `${config.API_URL}/v1/controllerdata/partcount`,
          {
            date: endDate, //endDate
            interval: selectedOption,
          }
        );
        if (response.data && Array.isArray(response.data.data)) {
          setData(response.data.data);
        } else {
          console.error("Invalid data in response:", response.data);
          setData([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setData([]);
      }
    };

    // fetchData();
  }, [selectedOption, endDate]);

  useEffect(() => {
    const requestData = {
      date: endDate,
      interval: selectedOption,
    };
    socket.emit("partProduce", requestData);
  }, [selectedOption, endDate]);

  useEffect(() => {
    socket.on("partProduce", (results) => {
      console.log("Received Part count data socket:", results);
      setData(results);

      // dispatch(setBaseInfo(results));
    });
  }, [socket]);
  return (
    <div
      style={{
        marginLeft: "10px",
        marginRight: "10px",
        marginTop: "10px",
      }}
    >
      <ScrollArea className="h-20.50 w-88 rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SrNo</TableHead>
              <TableHead>Machine</TableHead>
              <TableHead>Count</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item: ProductionData, index: number) => (
              <TableRow key={index}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  <Link
                    to={`/machine/${item.Name}`}
                    style={{
                      textDecoration: "none",
                      color: "black",
                      boxShadow: "0px 0px 0px rgba(0,0,0,0)",
                      transition: "box-shadow 0.3s ease",
                      display: "block", // Make the link a block-level element
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow =
                        "0px 5px 10px rgba(0,0,0,0.2)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow =
                        "0px 0px 0px rgba(0,0,0,0)";
                    }}
                  >
                    <div>{item.Name}</div>
                  </Link>
                </TableCell>
                <TableCell>{item.total_count}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}

export default ProductionCountTable;
