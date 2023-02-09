import React, { useContext, useEffect, useRef, useState } from "react";
import "../Component/NavBar";
import NavBar from "../Component/NavBar";
import { useQuery, gql } from "@apollo/client";
import appContext from "../Context/AppState";
import { ethers } from "ethers";
import erc721abi from "../abi/erc721abi.json";
import Metamask from "../Component/Metamask";
import Nftcard from "../Component/Nftcard";
import Profile from "../Component/Profile";
import SendETHButton from "../Component/SendETHButton";
import ReceiveButton from "../Component/ReceiveButton";
export default function Home() {
  const appstate = useContext(appContext);

  const [state_nft, setNft] = useState([]);
  const [openSendEth, setOpenSendEth] = useState(false);
  const [openReceive, setOpenReceive] = useState(false);
  const ref_nft = useRef([]);
  const testAddress = "ebd764efaa8a63e9e20b4fbe5b75d35062d58a3e";
  // replace testaddress with  appstate.ref_address.current for the connected wallet
  const NFTQUERY = gql`
    query nft {
      nft(where: { owneraddress: { _eq: "${testAddress}" } }) {
        contract_address
        tokenid
      }
    }
  `;

  const { loading, error, data } = useQuery(NFTQUERY);

  useEffect(() => {
    async function getNft() {
      data.nft.map(async (item) => {
        const contract = new ethers.Contract(
          item.contract_address,
          erc721abi,
          appstate.ref_provider.current
        );

        try {
          const metadata = await contract.tokenURI(item.tokenid);
          console.log("metadata,", metadata);
          if (metadata) {
            const url = metadata.replace("ipfs://", "https://ipfs.io/ipfs/");
            await fetch(url)
              .then((response) => response.json())
              .then((data) => {
                console.log(data);
                ref_nft.current.push({
                  contract_address: item.contract_address,
                  tokenid: item.tokenid,
                  metadata: data,
                });
              });
          }
        } catch (err) {
          console.log("no metadata");
          ref_nft.current.push({
            contract_address: item.contract_address,
            tokenid: item.tokenid,
            metadata: {
              image:
                "https://imgs.search.brave.com/4mxyeZd7fPPeyQOHAEOYtN6nX3ZrWXgjECmeZ5a_fX8/rs:fit:612:612:1/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vdmVjdG9y/cy9uby1pbWFnZS1h/dmFpbGFibGUtc2ln/bi12ZWN0b3ItaWQx/MTM4MTc5MTgzP2s9/NiZtPTExMzgxNzkx/ODMmcz02MTJ4NjEy/Jnc9MCZoPXByTVlQ/UDltTFJOcFRwM1hJ/eWtqZUpKOG9DWlJo/YjJpZXo2dktzOGE4/ZUU9",
              name: "Name not found",
              description: "Description not found",
            },
          });
        }
      });

      setNft(ref_nft.current);
    }
    if (!loading) getNft();
  }, [loading, appstate.ref_provider, data]);

  if (error) return <p>Error : {error.message}</p>;
  return (
    <div>
      <NavBar></NavBar>
      {appstate.ref_connected.current ? (
        <div className=" flex justify-center items-center flex-col mt-20">
          <Profile></Profile>
          <div className="flex justify-end items-center m-10">
            <SendETHButton
              open={openSendEth}
              setOpen={setOpenSendEth}
            ></SendETHButton>
            <ReceiveButton
              open={openReceive}
              setOpen={setOpenReceive}
            ></ReceiveButton>
          </div>
          <div>
            {!loading && appstate.ref_connected.current ? (
              <div className="w-full flex p-10 flex-wrap justify-center items-center ">
                {state_nft.map((item) => {
                  return (
                    <Nftcard
                      key={item.contract_address + item.tokenid}
                      item={item}
                    ></Nftcard>
                  );
                })}
              </div>
            ) : (
              <p>Loading...</p>
            )}
          </div>
        </div>
      ) : (
        <div className=" w-full h-screen flex flex-col justify-center items-center">
          <div className="text-lg font-bold text-center">
            {" "}
            Please connect your Metamask Wallet to continue !
          </div>
          <div className="w-40 h-14 flex justify-center items-center mt-5">
            <Metamask></Metamask>
          </div>
        </div>
      )}
    </div>
  );
}
