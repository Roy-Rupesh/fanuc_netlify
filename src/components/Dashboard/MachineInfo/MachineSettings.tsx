import React from "react";
import { useParams } from "react-router-dom";

export default function MachineSettings() {
  const { macId } = useParams();
  return (
    <div>
      <h3>Machine Settings : {macId}</h3>
    </div>
  );
}
