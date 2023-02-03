import React, { useContext, useEffect } from "react";
import { ethers } from "ethers";
import appContext from "../Context/AppState";
import Button from "@mui/material/Button";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
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
    <Button
      onClick={appstate.ref_connected.current ? disconnect : Connect}
      className="rounded-lg bg-blue-700 hover:bg-gray-800 w-full h-full text-white  flex justify-center items-center "
      variant="contained"
      startIcon={<AccountBalanceWalletIcon></AccountBalanceWalletIcon>}
    >
      {appstate.ref_connected.current
        ? appstate.state_address.substring(0, 5) +
          "..." +
          appstate.state_address.substring(38)
        : "Connect"}
    </Button>
  );
}
