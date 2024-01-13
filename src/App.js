import './App.css';
import Editor from './components/Editor';
import Home from './components/Home';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <>
      <Toaster position='top-right'></Toaster>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Home></Home>}></Route>
          <Route path='/editor/:roomId' element={<Editor></Editor>}></Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
