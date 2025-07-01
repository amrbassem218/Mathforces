import 'katex/dist/katex.min.css';
import './App.css';

import { useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Analytics } from "@vercel/analytics/next"
import router from './router';
import ServerManipulator from './components/serverManipulator';

  function App() {
  return (  
    <>
    <Toaster/>
    {/* <ServerManipulator/> */}
    <RouterProvider router={router}/>
    </>
  )
}

export default App
