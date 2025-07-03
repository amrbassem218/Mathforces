import * as React from "react";
import useSetTitle from "../../../utilities";

interface IErrorProps {}

const Error: React.FunctionComponent<IErrorProps> = (_props) => {
  useSetTitle('Error 404')
  return <div>404 Math not found</div>;
};

export default Error;
