import "./App.css";
import { Route, Routes } from "react-router-dom";
import "./Pages/Home";
import Home from "./Pages/Home";
import { useRef, useState } from "react";
import appContext from "./Context/AppState";

function App() {
  const ref_address = useRef();
  const ref_connected = useRef();
  const ref_web3Enable = useRef();
  const ref_provider = useRef();
  const ref_explorer = useRef();

  const [state_address, setAddress] = useState();
  const [state_connected, setConnected] = useState();
  const [state_web3Enable, setWeb3Enable] = useState();
  const [state_provider, setProvider] = useState();

  const appstate = {
    ref_address: ref_address,
    ref_connected: ref_connected,
    ref_web3Enable: ref_web3Enable,
    ref_provider: ref_provider,
    ref_explorer: ref_explorer,

    state_address: state_address,
    state_connected: state_connected,
    state_web3Enable: state_web3Enable,
    state_provider: state_provider,

    setAddress: setAddress,
    setConnected: setConnected,
    setWeb3Enable: setWeb3Enable,
    setProvider: setProvider,
  };

  return (
    <appContext.Provider value={appstate}>
      <Routes>
        <Route path="/" element={<Home></Home>}></Route>
      </Routes>
    </appContext.Provider>
  );
}

export default App;
