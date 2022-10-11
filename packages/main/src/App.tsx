import { useEffect } from 'react';
import './App.css';
import { animate } from './components';

function App() {
  useEffect(() => {
    animate();
  }, []);

  return (
    <div className='main'>
      <div className='menu'>
        <div className='menu_subitem menu_item'>
          <a href='./blogs/index.html'>BLOGS</a>
        </div>
        <div className='menu_item'>
          <span>GAMES</span>
          <div>
            <div className='menu_subitem'>
              <a href='./apmer/index.html'>APMER</a>
            </div>
            <div className='menu_subitem'>
              <a href='./g2m/index.html'>G2M</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
