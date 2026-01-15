import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Orders from './pages/Orders'
import PlaceOrder from './pages/PlaceOrder'
import Product from './pages/Product'
import Collection from './pages/collection'
import Contact from './pages/Contact'
import About from './pages/About'
import Navbar from './components/Navbar'


const App = () => {
  return (
    <div className='px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]  '>
      <Navbar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/orders' element={<Orders />} />
        <Route path='/place-order' element={<PlaceOrder />} />
        <Route path='/product/:productId' element={<Product />} />
        <Route path='/collection' element={<Collection />} />
        <Route path='/contact' element={<Contact />} />
        <Route path='/about' element={<About />} />
      </Routes>
    </div>
  )
}

export default App


