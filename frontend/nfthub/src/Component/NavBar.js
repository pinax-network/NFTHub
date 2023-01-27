import React from "react";
import "./Metamask";
import Metamask from "./Metamask";
export default function NavBar() {
  return (
    <div className="flex justify-between items-center p-6">
      <div>LOGO</div>
      <div>NFTHub</div>
      <Metamask></Metamask>
    </div>
  );
}
