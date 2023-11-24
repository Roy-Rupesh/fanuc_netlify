import ReactApexChart from "react-apexcharts";
import "./MachineInfo.css";
import { ApexOptions } from "apexcharts";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/types";
import { AppState } from "../../../redux/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../@/components/ui/card";

const UtilizationTrend = () => {
  const machineInfo = useSelector((state: RootState) => state.app.machineInfo);
  console.log("Inside UtilizationTrend");
  console.log(machineInfo);

  const seriesData = [
    {
      data: machineInfo.map((item) => [
        new Date(item.hour).getTime(),
        item.productionTime,
      ]),
    },
  ];

  const options: ApexOptions = {
    chart: {
      id: "area-datetime",
      type: "area",
      height: 180,
      zoom: {
        autoScaleYaxis: true,
      },
    },
    xaxis: {
      type: "datetime",
      categories: machineInfo.map((item) => item.hour), // Use the datetime values from sampleData
      tickAmount: 6,
      title: {
        text: "Time",
      },
    },
    dataLabels: {
      enabled: false,
    },
    markers: {
      size: 0,
      // style: "hollow",
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.9,
        stops: [0, 100],
      },
    },
    tooltip: {
      x: {
        format: "dd MMM yyyy HH:mm:ss",
      },
      y: {
        formatter: function (val, opts) {
          return (val / 60).toFixed(2).toString() + " production time"; // Convert val to string and add label
        },
        title: {
          formatter: function () {
            return "Time";
          },
        },
      },
    },
    yaxis: {
      labels: {
        formatter: function (val) {
          // Convert seconds to minutes and format the label
          return (val / 60).toFixed(2);
        },
      },
      title: {
        text: "Productive Time (min)",
        style: {
          color: "black",
        },
      },
    },
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Utilization Trend
          </CardTitle>
          {/* <div id="chart-y-axis-label" className="vertical-label">
            Productive Time
          </div> */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4 text-muted-foreground"
          >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            <ReactApexChart
              options={options}
              series={seriesData}
              type="area"
              height={180}
            />
          </div>
          {/* <div id="chart-x-axis-label" className="horizontal-label">
            Time
          </div> */}
          {/* <p className="text-xs text-muted-foreground">
            +20.1% from last month
          </p> */}
        </CardContent>
      </Card>
    </>
  );
};

export default UtilizationTrend;
