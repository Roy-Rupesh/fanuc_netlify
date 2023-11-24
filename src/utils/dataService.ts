import axios from "axios";
import config from "../config";

export async function fetchData(selectedOption: string, formattedDate: string) {
  try {
    const response = await axios.get(
      `${config.API_URL}/v1/data/${selectedOption}/${formattedDate}`
    );

    if (response.data && Array.isArray(response.data.data)) {
      return response.data.data;
    } else {
      console.error("Invalid data in response:", response.data);
      return [];
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
}
