import React, { useEffect, useState } from "react";
import CopyIconButton from "./CopyIconButton";
export default function Nftcard({ item }) {

  const [state_image,setImage] = useState("");

  useEffect(()=>{
    let imgurl;
  console.log(item.metadata);
  if (item.metadata.image.startsWith("ipfs"))
  {
     imgurl = "https://ipfs.io/ipfs/" + item.metadata.image.substring(7);
  }else{
    imgurl = item.metadata.image
  }
  setImage(imgurl)
  },[item])
  


  return (
    <div
      key={item.contract_address + item.tokenid}
      className=" shadow-md flex flex-col w-1/5 m-3  justify-center items-center  p-10  border border-gray-100 rounded-lg"
    >
      {item.metadata.image.substring(0, 5) === "https" ? (
        <img
          className="rounded-lg h-1/2"
          src={item.metadata.image}
          alt=""
        ></img>
      ) : (
        <img alt="" src={state_image}></img>
      )}

      <div className="flex flex-col w-full h-1/2 justify-start ">
        <div className="text-lg font-bold">{item.metadata.name}</div>
        <div className="truncate text-ellipsis">
          <div className="flex  items-center">
            {"Contract : " +
              item.contract_address.substring(0, 5) +
              "..." +
              item.contract_address.substring(35)}
            <div className="mx-2">
              <CopyIconButton
                font={"text-sm text-blue-600"}
                text={item.contract_address}
              ></CopyIconButton>
            </div>
          </div>
        </div>
        <div>{"TokenId : " + item.tokenid}</div>
      </div>
    </div>
  );
}
