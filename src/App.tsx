import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Router, RouterProvider, useLocation } from 'react-router-dom'
import router from './router'
import 'katex/dist/katex.min.css';
  function App() {
  const [count, setCount] = useState(0)

  return (  
    <RouterProvider router={router}/>
  )
}

export default App
