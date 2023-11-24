import React, { useState, useEffect, useContext, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../../redux/store";
import { fetchMachines } from "../../../redux/GanttReduces/machineSlice";
import FeedChart from "./FeedChart";
import FanucChart from "./FanucChart";
import PartTimelineChart from "./PartTimelineChart";
import "../../../assets/css/CombinedChart.css";
import moment from "moment-timezone";
import CommonTimeAxis from "./CommonTimeAxis";
import { fetchAllowedMachines } from "../../../redux/utilityDemoSlice";
import MachineDetail from "../MachineInfo/MachineDetail";
import { ScrollArea } from "../../../@/components/ui/scroll-area";

const CombinedChartsAllMachines: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const machines = useSelector((state: RootState) => state.machines.data);
  const status = useSelector((state: RootState) => state.machines.status);
  const error = useSelector((state: RootState) => state.machines.error);
  const [selectedMachine, setSelectedMachine] = useState<string>("");
  const [selectedHours, setSelectedHours] = useState<number>(1);
  const [chartWidth, setChartWidth] = useState<number>(500);
  const [hoveredTime, setHoveredTime] = useState<number | null>(null);


  const demoId = localStorage.getItem("demoId");
  console.log("in dashboard we got demoid", demoId);
  // useEffect(() => {
  //   dispatch(fetchMachines());
  // }, [dispatch]);



  useEffect(() => {
    dispatch(fetchMachines());
  }, [dispatch]);

  useEffect(() => {
    if (machines.length > 0 && !selectedMachine) {
      setSelectedMachine(machines[0].machineName);
    }
  }, [machines, selectedMachine]);

  // Add new state to keep track of active tooltip
  const [activeTooltipIndex, setActiveTooltipIndex] = useState<number | null>(
    null
  );
  const [timeTicks, setTimeTicks] = useState<number[]>([]);

  useEffect(() => {
    if (hoveredTime !== null) {
      // Let's say your chart data points are in sync with timeTicks, you'll find the index like this:
      const index = timeTicks.findIndex((tick) => tick === hoveredTime);
      setActiveTooltipIndex(index); // Set the state that FanucChart can use to control tooltip visibility
    } else {
      setActiveTooltipIndex(null); // Hide tooltip when not hovering
    }
  }, [hoveredTime, timeTicks]);

  // Define a function to determine tick interval based on selected hours
  const getTickInterval = (selectedHours: number): number => {
    if (selectedHours <= 1) {
      return 1; // 1 minute interval for 1 hour window
    } else if (selectedHours <= 8) {
      return 10; // 5 minutes interval for 8 hours window
    } else {
      return 30; // 30 minutes interval for 24 hours window
    }
  };

  useEffect(() => {
    const updateTimeTicks = () => {
      const tickInterval = getTickInterval(selectedHours); // Correctly use the function here to determine tick interval
      const endTime = moment().tz("UTC").seconds(0).milliseconds(0);
      const startTime = moment(endTime).subtract(selectedHours, "hours");

      const ticks: number[] = []; // Define ticks array with type
      while (startTime <= endTime) {
        ticks.push(startTime.valueOf());
        startTime.add(tickInterval, "minutes");
      }
      setTimeTicks(ticks);
    };

    updateTimeTicks();
    const intervalId = setInterval(
      updateTimeTicks,
      60000 * getTickInterval(selectedHours)
    );
    return () => clearInterval(intervalId);
  }, [selectedHours]);

  // Handlers for mouse events on charts
  const handleMouseOverOnChart = (index: number) => {
    setActiveTooltipIndex(index);
  };

  const handleMouseOutFromChart = () => {
    setActiveTooltipIndex(null);
  };

  const handleTimeHover = useCallback((hoverIndex: number | null) => {
    setActiveTooltipIndex(hoverIndex); // This index is then passed down to FanucChart
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const container = document.querySelector(".chart-wrapper");
      if (container) {
        setChartWidth(container.clientWidth);
      }
      if (window.innerWidth <= 768) {
        setSelectedHours(1);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (status === "loading") {
    return <div>Loading machines...</div>;
  }

  if (error) {
    return <div>Error fetching machines: {error}</div>;
  }

  return (
    <div>
      <div className="chart-wrapper">
        <div className="header-container">
          <h4>
            <strong>Machine</strong>
          </h4>
          <select
            value={selectedMachine}
            onChange={(e) => setSelectedMachine(e.target.value)}
            className="machine-selector"
          >
            {machines.map((machine) => (
              <option key={machine.machineName} value={machine.machineName}>
                {machine.machineName}
              </option>
            ))}
          </select>
        </div>

        <div className="button-container">
          <button
            onClick={() => setSelectedHours(1)}
            className={selectedHours === 1 ? "selected" : ""}
          >
            Last 1 hour
          </button>
          <button
            onClick={() => setSelectedHours(8)}
            className={selectedHours === 8 ? "selected" : ""}
          >
            Last 8 hours
          </button>
          <button
            onClick={() => setSelectedHours(24)}
            className={selectedHours === 24 ? "selected" : ""}
          >
            Last 24 hours
          </button>
          {/* <button
          onClick={() => setSelectedHours(168)}
          className={selectedHours === 168 ? "selected" : ""}
        >
          Last Week
        </button> */}
        </div>

        <CommonTimeAxis
          timeTicks={timeTicks}
          chartWidth={chartWidth}
          onHover={handleTimeHover} // Update this to handle index-based hover
        />

        <FanucChart
          selectedHours={selectedHours}
          selectedMachine={selectedMachine}
          chartWidth={chartWidth}
          timeTicks={timeTicks} // Pass timeTicks for common x-axis scaling
          activeTooltipIndex={activeTooltipIndex} // Pass active tooltip index for synchronization
          onMouseOver={handleMouseOverOnChart} // Pass mouse over handler
          onMouseOut={handleMouseOutFromChart} // Pass mouse out handler
          hoveredTime={hoveredTime}
        />
        <FeedChart
          selectedHours={selectedHours}
          selectedMachine={selectedMachine}
          chartWidth={chartWidth}
          timeTicks={timeTicks} // Pass timeTicks for common x-axis scaling
          activeTooltipIndex={activeTooltipIndex} // Pass active tooltip index for synchronization
          onMouseOver={handleMouseOverOnChart} // Pass mouse over handler
          onMouseOut={handleMouseOutFromChart} // Pass mouse out handler
          // hoveredTime={hoveredTime}
        />
        <PartTimelineChart
          selectedHours={selectedHours}
          selectedMachine={selectedMachine}
          chartWidth={chartWidth}
          timeTicks={timeTicks} // Pass timeTicks for common x-axis scaling
          activeTooltipIndex={activeTooltipIndex} // Pass active tooltip index for synchronization
          onMouseOver={handleMouseOverOnChart} // Pass mouse over handler
          onMouseOut={handleMouseOutFromChart} // Pass mouse out handler
          hoveredTime={hoveredTime}
        />
      </div>

      <MachineDetail selectedMachine={selectedMachine} />
    </div>
  );
};

export default CombinedChartsAllMachines;
