import 'katex/dist/katex.min.css';
import './App.css';

import { useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';

import router from './router';

  function App() {
  const [count, setCount] = useState(0)
  return (  
    <>
    <Toaster/>
    <RouterProvider router={router}/>
    </>
  )
}

export default App
