import './App.css';
import { WindowListView } from './components';
import { longList } from './models/constant';

function App() {
  return (
    <div className='App'>
      <h1>React Infinite Scroller</h1>
      <WindowListView listData={longList} />
    </div>
  );
}

export default App;
