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
    Availibility: 4000,
    Performance: 2400,
    OEE: 2400,
  },
  {
    name: "3rd",
    Availibility: 3000,
    Performance: 1398,
    OEE: 2210,
  },
  {
    name: "4th",
    Availibility: 2000,
    Performance: 9800,
    OEE: 2290,
  },
  {
    name: "5th",
    Availibility: 2780,
    Performance: 3908,
    OEE: 2000,
  },
  {
    name: "6th",
    Availibility: 1890,
    Performance: 4800,
    OEE: 2181,
  },
  {
    name: "7th",
    Availibility: 2390,
    Performance: 3800,
    OEE: 2500,
  },
  {
    name: "8th",
    Availibility: 3490,
    Performance: 4300,
    OEE: 2100,
  },
];
export default function DailyOee() {
  return (
    <div className="max-w-screen-lg mx-auto bg-white p-4 rounded-md shadow-md">
      <div className="text-2xl font-bold mb-4 text-center">
        DAILY OEE ANALYSIS
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
            dataKey="Performance"
            fill="#8884d8"
            label={<CustomLabel fill="gold" stroke="purple" />} // Use label for customization
          />
          <Bar
            dataKey="Availibility"
            fill="#82ca9d"
            label={<CustomLabel fill="gold" stroke="purple" />} // Use label for customization
          />
          <Bar
            dataKey="OEE"
            fill="#61A3BA"
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
