import { Outlet } from 'react-router-dom';
import './App.css';
import NavigationMenu from './components/navigationMenu/NavigationMenu';

function App() {
  return (
    <div className="App">
      <NavigationMenu></NavigationMenu>
      <Outlet></Outlet>
    </div>
  );
}

export default App;
