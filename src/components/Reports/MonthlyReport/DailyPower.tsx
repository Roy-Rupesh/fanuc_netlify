import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Rectangle,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
interface CustomLabelProps {
  fill: string;
  stroke: string;
}

const data = [
  {
    name: "2nd",
    Kwh: 4000,
    TargetCount: 2400,
    IdleTime: 2400,
  },
  {
    name: "3rd",
    Kwh: 3000,
    TargetCount: 1398,
    IdleTime: 2210,
  },
  {
    name: "4th",
    Kwh: 2000,
    TargetCount: 9800,
    IdleTime: 2290,
  },
  {
    name: "5th",
    Kwh: 2780,
    TargetCount: 3908,
    IdleTime: 2000,
  },
  {
    name: "6th",
    Kwh: 1890,
    TargetCount: 4800,
    IdleTime: 2181,
  },
  {
    name: "7th",
    Kwh: 2390,
    TargetCount: 3800,
    IdleTime: 2500,
  },
  {
    name: "8th",
    Kwh: 3490,
    TargetCount: 4300,
    IdleTime: 2100,
  },
];
export default function DailyPower() {
  return (
    <div className="max-w-screen-lg mx-auto bg-white p-4 rounded-md shadow-md">
      <div className="text-2xl font-bold mb-4 text-center">
        DAILY POWER CONSUMPTION
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />

          <Bar
            dataKey="Kwh"
            fill="	#DCBFFF"
            label={<CustomLabel fill="gold" stroke="purple" />} // Use label for customization
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
const CustomLabel: React.FC<CustomLabelProps> = ({ fill, stroke }) => (
  <text x="50%" y="50%" fill={fill} stroke={stroke} dy={-6} textAnchor="middle">
    {/* You can customize the label content here */}
  </text>
);
