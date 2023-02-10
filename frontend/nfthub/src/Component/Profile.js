import React, { useContext, useEffect } from "react";
import appContext from "../Context/AppState";
import { ethers } from "ethers";
import CopyIconButton from "./CopyIconButton";
export default function Profile() {
  const appstate = useContext(appContext);

  useEffect(() => {
    async function getBalance() {
      const eth = await appstate.ref_provider.current.getBalance(
        appstate.ref_address.current
      );
      
      appstate.setBalance(ethers.utils.formatEther(eth));
      appstate.ref_balance.current = ethers.utils.formatEther(eth);
    }

    getBalance();
  });

  return (
    <div className="flex justify-center items-center flex-col">
      <div className=" flex justify-center items-center flex-col">
        <div className="font-bold"> Account</div>
        <div className="text-gray-600 my-2 flex justify-center items-center">
          {appstate.state_address.substring(0, 5) +
            "..." +
            appstate.state_address.substring(38)}
          <CopyIconButton
            className="mx-2"
            font={"text-sm text-blue-600"}
            text={appstate.state_address}
          ></CopyIconButton>
        </div>

        <div className="w-12 h-12 rounded-full shadow-gray-400 shadow-md flex justify-center items-center object-contain my-5 ">
          <img alt="" src={require("../images/etherLogo.png")}></img>
        </div>
        <div className="text-4xl text-gray-800">
          {appstate.state_balance + " ETH"}
        </div>
      </div>
    </div>
  );
}
