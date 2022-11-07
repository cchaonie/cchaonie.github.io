import './app.css';

import { menuLinks } from './components/constant';
import Menu from './components/Menu/Menu';
import { MyScene } from './components/MyScene/MyScene';

function App() {
  return (
    <div className='main'>
      <div className='header'>
        <div className='myScene'>
          <MyScene />
        </div>
        <div className='menu'>
          <Menu links={menuLinks} />
        </div>
        {/* <div className='support'>
          <span className=''>Images are provided by </span>
          <a href='https://pixabay.com/'>
            <img
              height={50}
              src='https://pixabay.com/static/img/public/medium_rectangle_b.png'
              alt='Pixabay'
            />
          </a>
        </div> */}
      </div>
    </div>
  );
}

export default App;
