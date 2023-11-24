// macArrayUtils.ts

interface MacDataItem {
  mac: string;
  di2Sum: number;
}

export function calculateUniqueMacArray(data: any[]): MacDataItem[] {
  const uniqueMacData: { [key: string]: number } = {};

  // Loop through the data array and calculate the sums
  data.forEach((item: { data: { mac: any; io: { di2: any } } }) => {
    const mac = item.data?.mac;
    const di2 = item.data?.io?.di2;

    if (mac) {
      if (uniqueMacData[mac]) {
        // If the mac already exists in the object, add the di2 value to the sum
        uniqueMacData[mac] += di2 || 0;
      } else {
        // If the mac is not in the object, initialize the sum with di2 value
        uniqueMacData[mac] = di2 || 0;
      }
    }
  });

  // Convert the uniqueMacData object into an array of objects
  const uniqueMacArray = Object.keys(uniqueMacData).map((mac) => ({
    mac,
    di2Sum: uniqueMacData[mac],
  }));

  return uniqueMacArray;
}
