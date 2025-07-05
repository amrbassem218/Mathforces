import { createBrowserRouter } from "react-router-dom";
import Home from "./pages/home";
import Error from "./pages/error";
import Login from "./pages/login";
import SignUp from "./pages/signup";
import ProtectedRoutes from "./components/ui/protectedroutes";
import Contest from "./pages/contest";
import Contests from "./pages/contests";
import CreateContest from "./pages/create-contest";
import Ranking from "./pages/ranking";
import ProblemSet from "./pages/problemset";
import Profile from "./pages/profile";

export const router = createBrowserRouter([
  {
    element: <ProtectedRoutes />,
    children: [
      {
        element: <CreateContest />,
        path: "/create-contest",
        errorElement: <Error />,
      },
    ],
  },
  {
    element: <Home />,
    path: "/",
    errorElement: <Error />,
  },
  {
    element: <Login />,
    path: "/login",
    errorElement: <Error />,
  },
  {
    element: <SignUp />,
    path: "/signup",
    errorElement: <Error />,
  },
  {
    element: <Contests />,
    path: "/contests",
    errorElement: <Error />,
  },
  {
    element: <Contest />,
    path: "contest/:id/:registrationMode",
    errorElement: <Error />,
  },
  {
    element: <Ranking />,
    path: "ranking",
    errorElement: <Error />,
  },
  {
    element: <ProblemSet />,
    path: "problemset",
    errorElement: <Error />,
  },
  {
    element: <Profile />,
    path: "profile/:id",
    errorElement: <Error />,
  },
]);
export default router;
