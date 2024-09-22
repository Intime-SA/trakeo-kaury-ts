import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TrakeoAlimentosNaturales from "./ListaDescargas";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TrakeoAlimentosNaturales />} />
      </Routes>
    </Router>
  );
};

export default App;
