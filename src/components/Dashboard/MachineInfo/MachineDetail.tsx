import UtilizationTrend from "./UtilizationTrend";
import PartCountTrend from "./PartCountTrend";
import IdleTimeTrend from "./IdleTimeTrend";
import EnergyTrend from "./EnergyTrend";
import { useLocation, useParams } from "react-router-dom";
import { faArrowLeft, faCog } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef, useState } from "react";
import { setMachineInfo } from "../../../redux/reducers";
import { useDispatch, useSelector } from "react-redux";
import Spinner from "react-bootstrap/Spinner";
import MachineSettings from "./MachineSettings";
import axios from "axios";
import { AppState, RootState } from "../../../redux/types";
import { format } from "date-fns-tz";
import SingleMachinePdf from "../../Reports/SingleMachinePdf";
import config from "../../../config";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../@/components/ui/popover";
import { Button } from "../../../@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "../../../@/lib/utils";
import { Calendar } from "../../../@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import React from "react";
import { isAfter, subDays } from "date-fns";
import Header from "../Nav/Header";
import RangeSelect from "../Nav/RangeSelect";
import socket from "../../../socket.io";

interface MachineDetailsProps {
  selectedMachine: string;
}
const MachineDetails: React.FC<MachineDetailsProps> = ({ selectedMachine }) => {
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();
  const [totalProductionTime, setTotalProductionTime] = useState("00:00:00");
  const [totalIdleTime, setTotalIdleTime] = useState("00:00:00");
  const [totalPartCount, setTotalPartCount] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  const utilizationTrend = useRef<any>(null);
  const { Name } = useParams();
  const from = useSelector((state: RootState) => state.app.startDate);
  const to = useSelector((state: RootState) => state.app.endDate);
  const userInput = useSelector((state: RootState) => state.app.userInput);

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

  const cardContainerStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)", // Create 4 equally spaced columns
    gap: "10px", // Adjust the gap as needed
    margin: "10px 0px 10px 10px ",
  };
  // Helper function to convert seconds to "hh:mm:ss" format
  function secondsToHHMMSS(seconds: number) {
    seconds = Math.round(seconds);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  // Function to toggle settings page visibility
  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Machine specific API request");

        // Make a POST request to the API
        const response = await axios.post(
          `${config.API_URL}/v1/controllerdata/machineOEE`,
          {
            startDate: startDate,
            endDate: endDate,
            interval: userInput,
            machineName: Name,
          }
        );

        console.log("Inside Machine Details : ", response);

        if (!response.data) {
          throw new Error("Network response was not ok");
        }

        const data = await response.data;
        console.log("Machine data :", data.machineData);

        // Check if the 'data' object exists and contains a 'data' property which is an array
        if (data && data.machineData && Array.isArray(data.machineData)) {
          // Dispatch the action to store the data in Redux
          dispatch(setMachineInfo(data.machineData));
          console.log("Success");
          const productionTimeSum = await data.machineData.reduce(
            (total: any, entry: { productionTime: any }) =>
              total + entry.productionTime,
            0
          );
          console.log("productionTimeSum :", productionTimeSum);
          const idleTimeSum = await data.machineData.reduce(
            (total: any, entry: { idleTime: any }) => total + entry.idleTime,
            0
          );
          console.log("idleTimeSum :", idleTimeSum);
          const partCountSum = await data.machineData.reduce(
            (total: any, entry: { production: any }) =>
              total + entry.production,
            0
          );
          console.log("partCountSum :", partCountSum);

          setTotalProductionTime(secondsToHHMMSS(productionTimeSum));
          setTotalIdleTime(secondsToHHMMSS(idleTimeSum));
          setTotalPartCount(partCountSum);
          setIsLoading(false);
        } else {
          console.error("Invalid data format received from the API");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      }
    };

    // fetchData(); // Call the asynchronous function to fetch and process data
  }, [startDate, endDate, userInput]);

  //socket
  useEffect(() => {
    const emitSocketEvent = () => {
      const requestData = {
        startDate: startDate,
        endDate: endDate,
        interval: userInput,
        machineName: selectedMachine,
      };
      console.log("Socket emit");
      socket.emit("machineSpecificData", requestData);
    };

    // Emit socket event initially
    emitSocketEvent();

    // Set up interval to emit socket event continuously
    const intervalId = setInterval(() => {
      emitSocketEvent();
    }, 60000); // Adjust the interval time as needed

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, [startDate, endDate, userInput, selectedMachine]);

  // useEffect(() => {
  //   socket.on("machineSpecificData", (results) => {
  //     if (
  //       results &&
  //       results.machineData &&
  //       Array.isArray(results.machineData)
  //     ) {
  //       console.log("Received machine specific data socket:", results);

  //       const productionTimeSum = results.machineData.reduce(
  //         (total: any, entry: { productionTime: any }) =>
  //           total + entry.productionTime,
  //         0
  //       );
  //       console.log("productionTimeSum :", productionTimeSum);
  //       const idleTimeSum = results.machineData.reduce(
  //         (total: any, entry: { idleTime: any }) => total + entry.idleTime,
  //         0
  //       );
  //       console.log("idleTimeSum :", idleTimeSum);
  //       const partCountSum = results.machineData.reduce(
  //         (total: any, entry: { production: any }) => total + entry.production,
  //         0
  //       );
  //       setTotalProductionTime(secondsToHHMMSS(productionTimeSum));
  //       setTotalIdleTime(secondsToHHMMSS(idleTimeSum));
  //       setTotalPartCount(partCountSum);

  //       dispatch(setMachineInfo(results.machineData));

  //       setIsLoading(false);
  //     }

  //     // dispatch(setBaseInfo(results));
  //   });
  // }, [socket]);

  useEffect(() => {
    const handleMachineSpecificData = async (results: any[]) => {
      console.log("Received machine specific data socket:", results);

      if (results) {
        console.log("Received machine specific data socket:", results);

        const productionTimeSum = results.reduce(
          (total: any, entry: { productionTime: any }) =>
            total + entry.productionTime,
          0
        );
        const idleTimeSum = results.reduce(
          (total: any, entry: { idleTime: any }) => total + entry.idleTime,
          0
        );
        const partCountSum = results.reduce(
          (total: any, entry: { production: any }) => total + entry.production,
          0
        );

        setTotalProductionTime(secondsToHHMMSS(productionTimeSum));
        setTotalIdleTime(secondsToHHMMSS(idleTimeSum));
        setTotalPartCount(partCountSum);
        dispatch(setMachineInfo(results));

        setIsLoading(false);
      }
      // dispatch(setBaseInfo(results));
    };

    const initSocket = async (): Promise<void> => {
      return new Promise<void>((resolve) => {
        socket.on("machineSpecificData", (results) => {
          handleMachineSpecificData(results);
          resolve(); // Resolve the promise when the data is handled.
        });
      });
    };

    const setupSocket = async () => {
      await initSocket();
      // Additional setup or actions if needed after the socket is initialized.
    };

    setupSocket();
  }, [dispatch, selectedMachine]);

  return (
    <>
      {isLoading ? (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: "100vh" }}
        >
          <Spinner animation="border" role="status">
            {/* <span className="sr-only">Loading...</span> */}
          </Spinner>
        </div>
      ) : (
        <>
          <div>
            <div
              className="card shadow"
              style={{
                marginLeft: "10px",
                marginRight: "10px",
                marginTop: "10px",
                // height: "90px",
              }}
            >
              <div className="card-body">
                <div className="row">
                  <div className="col-12 col-md-4">
                    <p>Machine Name: {selectedMachine}</p>
                  </div>
                  <div className="col-12 col-md-4">
                    <p>Production Time:{totalProductionTime}</p>
                  </div>
                  <div className="col-12 col-md-4">
                    <p>Idle Time: {totalIdleTime}</p>
                  </div>
                  <div className="col-12 col-md-4">
                    <p>Operator Name: John </p>
                  </div>
                  <div className="col-12 col-md-4">
                    <p>Part Count: {totalPartCount}</p>
                  </div>
                  <div className="col-12 col-md-4">
                    <div
                      className={`btn btn-${
                        showSettings ? "secondary" : "btn btn-light"
                      }`}
                      onClick={toggleSettings}
                    >
                      {showSettings ? (
                        // Show "Back" button when showSettings is true
                        <>
                          <FontAwesomeIcon
                            icon={faArrowLeft}
                            className="ml-2"
                          />{" "}
                          Back
                        </>
                      ) : (
                        // Show settings icon when showSettings is false
                        <>
                          <FontAwesomeIcon icon={faCog} className="ml-2" />{" "}
                          Setting
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div style={cardContainerStyle}>
            {showSettings ? (
              <MachineSettings />
            ) : (
              <div className="trends-container">
                <div ref={utilizationTrend} className="trend-item">
                  <UtilizationTrend />
                </div>
                <div className="trend-item">
                  <PartCountTrend />
                </div>
                <div className="trend-item">
                  <IdleTimeTrend />
                </div>
                <div className="trend-item">{/* <EnergyTrend /> */}</div>
              </div>
            )}
          </div>

          <div style={{ display: "flex", marginBottom: "140px" }}>
            <SingleMachinePdf
              Name={selectedMachine}
              utilizationTrendRef={utilizationTrend}
            />
            {/* <Header />
            <RangeSelect /> */}
          </div>
        </>
      )}
    </>
  );
};

export default MachineDetails;
