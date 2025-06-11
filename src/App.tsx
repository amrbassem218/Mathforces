import 'katex/dist/katex.min.css';
import './App.css';

import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';

import router from './router';

function App() {
  return (  
    <>
      <Toaster/>
      <RouterProvider router={router}/>
    </>
  )
}
export default App
