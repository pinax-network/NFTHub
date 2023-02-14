import React, { useContext, useEffect, useRef, useState } from "react";
import "../Component/NavBar";
import NavBar from "../Component/NavBar";
import { gql } from "@apollo/client";
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
  const [loading,setLoading] = useState(false);
  const ref_nft = useRef([]);
  const testAddress = "4c3898ba139984699cd9621fa539fd18e49e5e27"; //23eb354a934ca440f41b74d4f680a6c4eca7660b
  // replace testaddress with  appstate.ref_address.current for the connected wallet
  




  useEffect(() => {


    
  async function fetchGraphQL(operationsDoc, operationName, variables) {
    const result = await fetch(
      "https://promoted-hound-24.hasura.app/v1/graphql",
      {
        method: "POST",
        body: JSON.stringify({
          query: operationsDoc,
          variables: variables,
          operationName: operationName
        })
      }
    );
  
    return await result.json();
  }
  
  const operationsDoc = `
    query MyQuery {
      nft(where: {owneraddress: {_eq: "${appstate.ref_address.current}"}}}) {
        contract_address
        tokenid
        metadata
      }
    }
  `;
  
  function fetchMyQuery() {
    return fetchGraphQL(
      operationsDoc,
      "MyQuery",
      {}
    );
  }
  
  async function startFetchMyQuery() {
    const { errors, data } = await fetchMyQuery();
  
    if (errors) {
      // handle those errors like a pro
      console.error(errors);
    }
  
    // do something great with this precious data
    console.log(data);
  }

    async function getNft() {
      const data = startFetchMyQuery();
      data.nft.map(async (item) => {
        const contract = new ethers.Contract(
          item.contract_address,
          erc721abi,
          appstate.ref_provider.current
        );

        try {
          const metadata = item.metadata;
          let url;
          let jsonmetadata;
    
          if (metadata) {
            if (metadata.startsWith("ipfs")) {
              url = metadata.replace("ipfs://", "https://ipfs.io/ipfs/");
              await fetch(url)
                .then((response) => response.json())
                .then((data) => {
                  jsonmetadata = data;
                });
            } else if (metadata.startsWith("http")) {
              await fetch(url)
                .then((response) => response.json())
                .then((data) => {
                  jsonmetadata = data;
                });
            } else if (metadata.startsWith("data")) {
              const parts = metadata.split(",");
              const data = Buffer.from(parts[1], "base64").toString();
              jsonmetadata = JSON.parse(data);
            }

            ref_nft.current.push({
              contract_address: item.contract_address,
              tokenid: item.tokenid,
              metadata: jsonmetadata,
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
    if (!loading && appstate.state_connected) getNft();
  }, [loading, appstate.ref_provider,appstate.state_connected]);

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
