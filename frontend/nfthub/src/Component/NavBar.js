import React from "react";
import "./Metamask";
import Metamask from "./Metamask";
export default function NavBar() {
  return (
    <div className="flex justify-center items-center p-6">
      <div className="w-24">LOGO</div>
      <div className="mx-auto text-2xl text-blue-600 font-bold">NFTHub</div>
      <div className="w-24 h-12">
      <Metamask></Metamask>
      </div>
    
    </div>
  );
}
