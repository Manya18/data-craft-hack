import { Outlet } from "react-router-dom";
import "./App.css";
import HeaderBar from "./components/headerBar/HeaderBar";

function App() {
  return (
    <div className="App">
      <HeaderBar />
      <Outlet></Outlet>
    </div>
  );
}

export default App;
