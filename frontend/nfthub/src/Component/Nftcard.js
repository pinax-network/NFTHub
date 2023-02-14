import React, { useEffect, useState } from "react";
import CopyIconButton from "./CopyIconButton";
export default function Nftcard({ item }) {
  const [state_image, setImage] = useState("");

  useEffect(() => {
    console.log(item);
    let imgurl;
    if (item.metadata.image.startsWith("ipfs")) {
      imgurl = "https://ipfs.io/ipfs/" + item.metadata.image.substring(7);
    } else {
      imgurl = item.metadata.image;
    }
    setImage(imgurl);
  }, [item]);

  return (
    <div
      key={item.contract_address + item.tokenid}
      className="  shadow-md flex flex-col w-[200px] h-[300px] l:w-[300px] l:h-[400px] xl:w-[400px] xl:h-[500px]  m-3  justify-center items-center  p-10  border border-gray-100 rounded-lg"
    >
      <div className="w-full h-2/3 flex justify-center items-center">
        {item.metadata.image.substring(0, 5) === "https" ? (
          <img
            className="rounded-lg object-cover"
            src={item.metadata.image}
            alt=""
          ></img>
        ) : (
          <img
            alt=""
            className="rounded-lg object-cover"
            src={state_image}
          ></img>
        )}
      </div>

      <div className="flex flex-col w-full h-1/3 justify-end ">
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
