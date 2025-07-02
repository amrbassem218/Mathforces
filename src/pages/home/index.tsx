import { Button } from "@/components/ui/button";
import Header from "@/components/ui/Header";
import { useAuthUserContext } from "@/context/authUserContext";
import * as React from "react";

interface IHomeProps {}

const Home: React.FunctionComponent<IHomeProps> = (_props) => {
  const { logout } = useAuthUserContext();
  return (
    <>
      <div className="flex flex-col h-screen">
        <Header login={"full"} signup={"outline"} />
        <div className="flex flex-col flex-grow justify-center items-center">
          <h1 className="text-4xl font-medium mb-4">
            Go to Contests and prove your dominance{" "}
          </h1>
          <p className="text-sm ">
            (I promise it's going to look pretty, inital{" "}
            <a
              href="https://www.figma.com/design/8J9sj1J0mAInp9GeWPDpPY/Mathforces?node-id=0-1&t=QSSiwEyCxex7bQV6-1"
              className="underline text-blue-600"
            >
              fimga design
            </a>
            )
          </p>
        </div>
      </div>
      <Button onClick={logout}>logout</Button>
      <div>That's home</div>
    </>
  );
};

export default Home;
