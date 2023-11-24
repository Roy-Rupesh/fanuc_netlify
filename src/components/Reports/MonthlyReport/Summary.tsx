export default function Summary() {
  return (
    <div className="max-w-screen-lg mx-auto bg-white p-4 rounded-md shadow-md">
      <table className="table-auto w-full">
        <thead>
          <tr>
            <th
              colSpan={3}
              className="text-lg font-semibold border-b px-4 py-2 text-center"
            >
              SUMMARY OF MONTH
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border px-4 py-2">Total Hour : </td>
            <td className="border px-4 py-2">OEE :</td>
            <td className="border px-4 py-2">Production :</td>
          </tr>
          <tr>
            <td className="border px-4 py-2">Machine Ontime : </td>
            <td className="border px-4 py-2">Avalibility :</td>
            <td className="border px-4 py-2">Target Production :</td>
          </tr>
          <tr>
            <td className="border px-4 py-2">Productive Time : </td>
            <td className="border px-4 py-2">Performance : </td>
            <td className="border px-4 py-2">Rejection Qty: </td>
          </tr>
          <tr>
            <td className="border px-4 py-2">Idel Time : </td>
            <td className="border px-4 py-2">Quality Rate : </td>
            <td className="border px-4 py-2">Actual Production: </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
