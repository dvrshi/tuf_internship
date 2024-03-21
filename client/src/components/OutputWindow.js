import React from "react";

const OutputWindow = ({ outputDetails }) => {
  const getOutput = () => {
    let statusId = outputDetails?.status?.id;

    if (statusId === 6) {
      // compilation error
      return (
        <pre className=" font-normal text-xs text-red-500">
          {atob(outputDetails?.compile_output)}
        </pre>
      );
    } else if (statusId === 3) {
      return (
        <pre className=" font-normal text-s text-green-400">
          {atob(outputDetails.stdout) !== null
            ? `${atob(outputDetails.stdout)}`
            : null}
        </pre>
      );
    } else if (statusId === 5) {
      return (
        <pre className=" font-normal text-s text-red-500">
          {`Time Limit Exceeded`}
        </pre>
      );
    } else {
      return (
        <pre className=" font-normal text-s text-red-500">
          {atob(outputDetails?.stderr)}
        </pre>
      );
    }
  };
  return (
    <>
      <div className="">
        {outputDetails ? <>{getOutput()}</> : null}
      </div>
    </>
  );
};

export default OutputWindow;
