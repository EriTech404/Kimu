import { useState } from "react";
import "./App.css";
import SideBar from "./Commponets/SideBar";
import KeyCard from "./Commponets/KeyCard";
import AddKeyModal from "./Commponets/AddKeyModal";


function App() {


  return (
    <div className="app-container">
      <SideBar collapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
      
      
    </div>
  );
}

export default App;
