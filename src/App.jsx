import { useState } from 'react'
import './App.css'
import {Route, Routes} from 'react-router-dom'
import PhotoPrintPrev from './pages/PhotoPrintPrev'
import UploadPhotos from './pages/UploadPhotos'
import Checkout from './pages/Checkout'
import Success from './pages/Success'
import AdminPage from './pages/AdminPage'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <Routes>
      <Route path='/' element={<PhotoPrintPrev/>} />
      <Route path='/image/upload' element={<UploadPhotos/>} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/success" element={<Success />} />
      <Route path='/admin' element={<AdminPage/>} />
    </Routes>
    </>
  )
}

export default App
