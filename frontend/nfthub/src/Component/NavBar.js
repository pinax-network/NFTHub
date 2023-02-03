import React from "react";
import "./Metamask";
import Metamask from "./Metamask";

export default function NavBar() {
  return (
    <div className="flex justify-center items-center p-6  shadow-md ">
      <div className="w-40">
        <img
          className="w-32 h-32"
          alt=""
          src={require("../images/logo.png")}
        ></img>
      </div>

      <div className="mx-auto text-2xl text-blue-700 font-bold">NFTHub</div>
      <div className="w-40 h-12">
        <Metamask></Metamask>
      </div>
    </div>
  );
}
