import { useState } from 'react'
import './App.css'
import {Route, Routes} from 'react-router-dom'
import PhotoPrintPrev from './pages/PhotoPrintPrev'
import UploadPhotos from './pages/UploadPhotos'
import Checkout from './pages/Checkout'
import Success from './pages/Success'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <Routes>
      <Route path='/' element={<PhotoPrintPrev/>} />
      <Route path='/image/upload' element={<UploadPhotos/>} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/success" element={<Success />} />
    </Routes>
    </>
  )
}

export default App
