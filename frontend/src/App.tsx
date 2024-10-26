import React from 'react';
import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import useLocalStorage from 'use-local-storage'
import StartPage from './components/StartPage';
import InteractiveTable from './components/InteractiveTable';
import KanbanBoard from './components/KanbanBoard/KanbanBoard';

function App() {
  const defaultDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const [theme, setTheme] = useLocalStorage('theme', defaultDark ? 'dark' : 'light');
  const [colorTheme, setColorTheme] = useLocalStorage('colorTheme', 'blue');


  return (
    // <BrowserRouter>
    <div className="App" data-theme={`${theme}-${colorTheme}`}>
      <Routes>
        <Route path="/" element={<StartPage />} />
        <Route path="/table" element={<InteractiveTable />} />
        <Route path="/analys" element={<KanbanBoard />} />
      </Routes>
    </div>
    // </BrowserRouter>
  );
}

export default App;
