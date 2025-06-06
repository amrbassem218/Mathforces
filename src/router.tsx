import { createBrowserRouter } from "react-router-dom";
import Home from "./pages/home";
import Error from "./pages/error";
import Login from "./pages/login";
import SignUp from "./pages/signup";
import ProtectedRoutes from "./components/ui/protectedroutes";
import Contest from "./pages/contest";
import Contests from "./pages/contests";

export const router = createBrowserRouter([
    {
        element: <ProtectedRoutes/>,
        children:[
            {
                element: <Home/>,
                path: "/",
                errorElement: <Error/>
            },
        ]
    },
    {
        element: <Login/>,
        path: "/login",
        errorElement: <Error/>
    },
    {
        element: <SignUp/>,
        path: "/signup",
        errorElement: <Error/>
    },
    {
        element: <Contests/>,
        path: "/contests",
        errorElement: <Error/>
    },
    {
        element: <Contest/>,
        path: "contest/:id",
        errorElement: <Error/>
    },
])
export default router;