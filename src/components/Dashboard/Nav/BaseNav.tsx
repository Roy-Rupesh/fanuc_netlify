import React, { useEffect, useState } from "react";
import OeeChart from "../Charts/OeeChart";
import PortCountChart from "../Charts/PortCountChart";
import ProductionCountChart from "../Charts/ProductionCountChart";
import IdleTimeChart from "../Charts/IdleTimeChart";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../@/components/ui/tabs";
import { Card } from "../../../@/components/ui/card";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../redux/types";
import { format } from "date-fns";
import socket from "../../../socket.io";
import { setAvgOee, setBaseInfo } from "../../../redux/reducers";

function BaseNav() {
  // Set the initial active component to "OEE"
  const [activeComponent, setActiveComponent] = useState("OEE");

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

  const userInput = useSelector((state: RootState) => state.app.userInput);

  // useEffect(() => {
  //   const requestData = {
  //     startDate: startDate,
  //     endDate: endDate,
  //     interval: userInput,
  //   };
  //   socket.emit("allMachineOee", requestData);
  //   console.log("socket");
  // }, [startDate, endDate, userInput, socket]);

  useEffect(() => {
    // Function to emit socket event
    const emitSocketEvent = () => {
      const requestData = {
        startDate: startDate,
        endDate: endDate,
        interval: userInput,
      };
      socket.emit("allMachineOee", requestData);
      console.log("Socket event emitted");
    };

    // Emit socket event initially
    emitSocketEvent();

    // Set up interval to emit socket event continuously
    const intervalId = setInterval(() => {
      emitSocketEvent();
    }, 60000); // Adjust the interval time as needed (e.g., every 5000 milliseconds)

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
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
      dispatch(setAvgOee(averageOEE));
      dispatch(setBaseInfo(results));
    });
  }, [socket]);

  // Function to set the active component based on user's choice
  const handleComponentChange = (component: React.SetStateAction<string>) => {
    setActiveComponent(component);
  };

  // Render the selected component
  const renderActiveComponent = () => {
    switch (activeComponent) {
      case "OEE":
        return <OeeChart />;
      case "PortCount":
        return <PortCountChart />;
      case "ProductionCount":
        return <ProductionCountChart />;
      case "IdleTime":
        return <IdleTimeChart />;
      default:
        return <p>Select a component to render.</p>;
    }
  };

  return (
    <Tabs defaultValue="OEE" style={{ marginTop: "20px" }}>
      {/* style={{ display: "flex" }} */}
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger
          value="OEE"
          onClick={() => handleComponentChange("OEE")}
          style={
            activeComponent === "OEE"
              ? { backgroundColor: "#E1C78F", color: "black" }
              : {}
          }
        >
          Company OEE
        </TabsTrigger>
        <TabsTrigger
          value="PortCount"
          onClick={() => handleComponentChange("PortCount")}
          style={
            activeComponent === "PortCount"
              ? { backgroundColor: "#E1C78F", color: "black" }
              : {}
          }
        >
          Part Count
        </TabsTrigger>
        <TabsTrigger
          value="ProductionCount"
          onClick={() => handleComponentChange("ProductionCount")}
          style={
            activeComponent === "ProductionCount"
              ? { backgroundColor: "#E1C78F", color: "black", fontSize: 11 }
              : {}
          }
        >
          Production Time
        </TabsTrigger>
        <TabsTrigger
          value="IdleTime"
          onClick={() => handleComponentChange("IdleTime")}
          style={
            activeComponent === "IdleTime"
              ? { backgroundColor: "#E1C78F", color: "black" }
              : {}
          }
        >
          Idle Time
        </TabsTrigger>
      </TabsList>
      <TabsContent value="OEE">{renderActiveComponent()}</TabsContent>
      <TabsContent value="PortCount">{renderActiveComponent()}</TabsContent>
      <TabsContent value="ProductionCount">
        {renderActiveComponent()}
      </TabsContent>
      <TabsContent value="IdleTime">{renderActiveComponent()}</TabsContent>
    </Tabs>
  );
}
export default BaseNav;
