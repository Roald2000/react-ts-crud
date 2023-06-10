import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  Outlet,
  Link,
  RouterProvider
} from 'react-router-dom';

import { useState } from 'react';
import Home from './Pages/Home';
import CreateItem from './Pages/CreateItem'; 


function NavigationBar() {
  return <>
    <nav id='menu-nav'>
      <Link to={'/'}>Home</Link>
      <Link to={'/create'}>Create</Link>
    </nav>
  </>
}

function Content(): JSX.Element {

  const [toggleNavbar, setNavbar] = useState(false);

  return <div id='root-content' className='container mx-auto my-0 pb-6'>
    <header onMouseLeave={() => setNavbar(false)} className='z-50 flex flex-row justify-between items-center w-full p-3 bg-slate-400 sticky top-0 left-0' >
      <nav id='main-nav' className='flex flex-row gap-3'>
        <Link to={'/'}>Home</Link>
        <Link to={'/create'}>Create</Link>
      </nav>
      <nav id='menu'>
        <button id='menu-btn' type='button' onClick={() => setNavbar(!toggleNavbar)}>Menu</button>
      </nav>
      {toggleNavbar && <NavigationBar />}
    </header>
    <main className='p-3'>
      <Outlet />
    </main>
  </div >
}


export default function App() {

  const router = createBrowserRouter(createRoutesFromElements(
    <Route path='/' element={<Content />}>
      <Route path='/' element={<Home />} />
      <Route path='/create' element={<CreateItem />} /> 
      <Route path='*' element={<h1>Invalid Route</h1>} />
    </Route>
  ))


  return <RouterProvider router={router} />

}

