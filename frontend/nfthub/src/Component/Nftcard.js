import React, { useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import abi from "../abi/erc721abi.json";
import CopyIconButton from "./CopyIconButton";
import appContext from "../Context/AppState";
import SendNFTButton from "./SendNFTButton";
export default function Nftcard({ item }) {
  const [state_image, setImage] = useState("");
  const [open, setOpen] = useState(false);
  const appstate = useContext(appContext);
  useEffect(() => {
    let imgurl;
    if (item.metadata.image.startsWith("ipfs")) {
      imgurl = "https://ipfs.io/ipfs/" + item.metadata.image.substring(7);
    } else {
      imgurl = item.metadata.image;
    }
    setImage(imgurl);
  }, [item]);

  async function transferNft(toaddress) {
    const contract = new ethers.Contract(
      item.contract_address,
      abi,
      appstate.ref_provider.current.getSigner()
    );
    const transaction = await contract[
      "safeTransferFrom(address,address,uint256)"
    ](appstate.ref_address.current, toaddress, item.tokenid);
    return transaction;
  }

  return (
    <div className="relative group flex justify-center items-center  w-[200px] h-[300px] l:w-[300px] l:h-[400px] xl:w-[400px] xl:h-[500px]">
      <div
        key={item.contract_address + item.tokenid}
        className="absolute group-hover:opacity-25 group-hover:border-gray-700 group-hover:blur-[2px]  shadow-md flex flex-col w-full h-full  m-3  justify-center items-center  p-10  border border-gray-100 rounded-lg"
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
      <div className=" opacity-0 w-full h-full flex justify-center items-center group-hover:opacity-100 absolute ">
        <SendNFTButton
          nft={item}
          image={state_image}
          open={open}
          setOpen={setOpen}
          transferNft={transferNft}
        ></SendNFTButton>
      </div>
    </div>
  );
}
