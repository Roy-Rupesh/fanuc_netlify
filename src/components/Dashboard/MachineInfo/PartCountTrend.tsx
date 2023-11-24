import React, { useState } from "react";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useSelector } from "react-redux";
import { AppState, RootState } from "../../../redux/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../@/components/ui/card";

const PartCountTrend = () => {
  const machineInfo = useSelector((state: RootState) => state.app.machineInfo);

  const seriesData = [
    {
      data: machineInfo.map((item) => [
        new Date(item.hour).getTime(),
        item.production,
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
    yaxis: {
      title: {
        text: "Part Count (No's)",
        style: {
          color: "black",
        },
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
          return val.toString() + " production Count"; // Convert val to string and add label
        },
        title: {
          formatter: function () {
            return "Time";
          },
        },
      },
    },
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Part Count Trend</CardTitle>

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

        {/* <p className="text-xs text-muted-foreground">+20.1% from last month</p> */}
      </CardContent>
    </Card>
  );
};

export default PartCountTrend;
