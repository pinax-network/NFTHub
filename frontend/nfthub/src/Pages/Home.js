import React, { useContext, useEffect, useRef, useState } from "react";
import "../Component/NavBar";
import NavBar from "../Component/NavBar";
import { useQuery, gql } from "@apollo/client";
import appContext from "../Context/AppState";
import { ethers } from "ethers";
import erc721abi from "../abi/erc721abi.json";
import { IpfsImage } from "react-ipfs-image";

export default function Home() {
  const appstate = useContext(appContext);

  const [state_nft, setNft] = useState([]);
  const ref_nft = useRef([]);
  const testAddress = "0008d343091ef8bd3efa730f6aae5a26a285c7a2";
  // replace testaddress with  appstate.ref_address.current
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
    if (!loading) getNft();
  }, [loading]);

  async function getNft() {
    console.log("getNFT");
    data.nft.map(async (item) => {
      const contract = new ethers.Contract(
        item.contract_address,
        erc721abi,
        appstate.ref_provider.current
      );

      try {
        const metadata = await contract.tokenURI(item.tokenid);
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

  if (error) return <p>Error : {error.message}</p>;
  return (
    <div>
      <NavBar></NavBar>
      {appstate.ref_connected.current ? (
        <div>
          {!loading && appstate.ref_connected.current ? (
            <div className="flex p-10">
              {state_nft.map((item) => {
                return (
                  <div key={item.contract_address + item.tokenid}>
                    <div className="flex flex-col justify-center items-center  p-10 border-black border rounded-lg">
                      {item.metadata.image.substring(0, 5) === "https" ? (
                        <img
                          className="rounded-lg h-1/2"
                          src={item.metadata.image}
                          alt=""
                        ></img>
                      ) : (
                        <IpfsImage
                          className="rounded-lg w-60 h-60"
                          hash={item.metadata.image}
                        ></IpfsImage>
                      )}

                      <div className="flex flex-col w-full h-1/2 justify-start ">
                        <div className="text-lg font-bold">
                          {item.metadata.name}
                        </div>
                        <div>{"Contract : " + item.contract_address}</div>
                        <div>{"TokenId : " + item.tokenid}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p>Loading...</p>
          )}
        </div>
      ) : (
        <div>Please connect your Metamask Wallet to continue !</div>
      )}
    </div>
  );
}
