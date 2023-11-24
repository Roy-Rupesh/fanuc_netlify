export interface AppState {
  macId: string;
  machineInfo: any[];
  baseInfo: any[];
  selectedOption: "24";
  formattedDate: string;
  userInput: number;
  startDate: Date | null;
  endDate: Date | null;
  avgOee: any;
  selectedMachine_R: any;
}

export interface RootState {
  app: {
    macId: string;
    selectedOption: string;
    machineInfo: any[];
    baseInfo: any[];
    formattedDate: string;
    userInput: number;
    startDate: Date | null; // Add startDate property
    endDate: Date | null;
    avgOee: any;
    selectedMachine_R: any;
  };
}

export type ProductionData = {
  _id: string;
  data: {
    mac: string;
    uid: number;
    dtm: string;
    io: {
      di1: number;
      di2: number;
      di5: number;
      di6: number;
    };
    modbus: {
      sid: number;
      stat: number;
      rcnt: number;
      iochangestatus: number;
      di5: number;
      di6: number;
      di7: number;
      di8: number;
      di9: number;
      di10: number;
    }[];
  };
  __v: number;
};

export type Machine = {
  machineLocation: string;
  machinePhoto: string;
  controllerPhoto: string;
  _id: string;
  machineName: string;
  machine_type: string;
  machineMake: string;
  mfgEmail: string;
  machineMakeYear: number;
  machineWarranty: number;
  maintenancePerson: string;
  statusMapping: {
    idle: number;
    productive: number;
    _id: string;
  };
  machineId: string;
  __v: number;
  gatewayId: string;
};

export type Gateway = {
  _id: string;
  macId: string;
  name: string;
  ip: string;
  port: number;
  isActive: boolean;
  issuedDate: string;
  gatewayId: string;
  __v: number;
};

export interface GanttState {
  productionData: ProductionData[];
  allMacIds: string[];
  allMachines: Machine[]; // <-- Add this line
  selectedMachine: Machine | null; // <-- Add this line
  loading: boolean;
  error: string | null;
}

export interface UtilityDemo {
  companyName: string;
  contactPersonName: string;
  contactPersonNumber: string;
  email: string;
  address: string;
  city: string;
  numOfMachines: number;
  numOfHardwireMachines: number;
  numOfControllerMachines: number;
  demoReportDuration: number;
  demoType: string;
  machineList: { machineName: string }[];
}
