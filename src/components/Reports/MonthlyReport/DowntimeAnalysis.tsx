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
    Production: 4000,
    MachineIdle: 2400,
    IdleTime: 2400,
  },
];
export default function DowntimeAnalysis() {
  return (
    <div className="max-w-screen-lg mx-auto bg-white p-4 rounded-md shadow-md">
      <div className="text-2xl font-bold mb-4 text-center">
        DOWNTIME ANALYSIS
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
          barGap={100}
        >
          <CartesianGrid strokeDasharray="3 3" />
          {/* <XAxis dataKey="name" /> */}
          <YAxis />
          <Tooltip />
          <Legend />

          <Bar
            dataKey="Production"
            fill="	#739072"
            label={<CustomLabel fill="gold" stroke="purple" />} // Use label for customization
          />
          <Bar
            dataKey="MachineIdle"
            fill="	#F875AA"
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
