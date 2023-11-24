import { useRouteError } from "react-router-dom";

interface MyError {
  status?: number;
  statusText?: string;
}

const Error = () => {
  const err = useRouteError() as MyError;

  const status = err?.status || "Unknown";
  const statusText = err?.statusText || "An error occurred";

  return (
    <div>
      <h2 style={{ color: "gray" }}>{status + " : " + statusText}</h2>
      <img
        src="https://cdn.dribbble.com/users/774806/screenshots/3823110/media/83278e3383766404500adc75f177bc69.gif"
        alt="Something went wrong!"
      ></img>
    </div>
  );
};

export default Error;
