import * as React from "react";

interface IErrorProps {}

const Error: React.FunctionComponent<IErrorProps> = (_props) => {
  return <div>404 Math not found</div>;
};

export default Error;
