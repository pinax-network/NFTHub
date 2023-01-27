import React, { useContext } from "react";
import "../Component/NavBar";
import NavBar from "../Component/NavBar";
import { useQuery, gql } from "@apollo/client";
import appContext from "../Context/AppState";
export default function Home() {
  const appstate = useContext(appContext);
  const testAddress = "87c20fb9ce1341f2df1464c980eb384f102dbfee";
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

  if (error) return <p>Error : {error.message}</p>;
  return (
    <div>
      <NavBar></NavBar>
      {!loading ? (
        data.nft.map((item) => {
          return (
            <div
              key={item.contract_address + item.tokenid}
              className="flex justify-around"
            >
              <div>{"CONTRACT: " + item.contract_address} </div>
              <div> {"TOKEN ID " + item.tokenid}</div>
            </div>
          );
        })
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
