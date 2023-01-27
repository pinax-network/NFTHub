import React, { useContext, useEffect } from "react";
import { ethers } from "ethers";
import appContext from "../Context/AppState";
export default function Metamask() {
  const appstate = useContext(appContext);

  useEffect(() => {
    function init() {
      if (window.ethereum) {
        appstate.ref_web3Enable.current = true;
        appstate.setWeb3Enable(true);
        appstate.ref_provider.current = new ethers.providers.Web3Provider(
          window.ethereum
        );
        appstate.setProvider(appstate.ref_provider.current);
      } else {
        appstate.ref_web3Enable.current = false;
        appstate.setWeb3Enable(false);

        appstate.ref_provider.current = null;
        appstate.setProvider(null);
      }
    }
    init();
    // eslint-disable-next-line
  }, []);

  async function Connect() {
    if (appstate.ref_web3Enable.current) {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      appstate.ref_address.current = accounts[0];
      appstate.setAddress(accounts[0]);
      appstate.ref_connected.current = true;
      appstate.setConnected(true);
    }
  }

  function disconnect() {
    if (appstate.ref_web3Enable.current && appstate.ref_connected.current) {
      appstate.ref_connected.current = false;
      appstate.setConnected(false);
      appstate.ref_address.current = "";
      appstate.setAddress("");
    }
  }

  return (
    <div
      onClick={appstate.ref_connected.current ? disconnect : Connect}
      className="rounded-lg bg-blue-500 text-white py-3 px-5 "
    >
      {appstate.ref_connected.current ? appstate.state_address : "Connect"}
    </div>
  );
}
