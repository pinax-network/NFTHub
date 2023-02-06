# NFTHub

NFTHub is an open-source platform that allows users to access all their NFT data and interact with their NFTs without the need of a centralized company like OpenSea.
This application offers a web application for users and in the future, a GraphQL API for other dApps that want NFT data.
All data is indexed using Substreams technologie https://substreams.streamingfast.io/ and is accessible through a GraphQL endpoint. This first iteration only supports ETH NFTs and the MetaMask wallet.

## For Substreams Developpement and Initialise your Database:
### Requirement
- [Install Rust language](https://www.rust-lang.org/)
- [Install GO](https://go.dev/learn/)
- [Install Substream CLI](https://substreams.streamingfast.io/)
- [Install Substream Sink PostGreSQl](https://substreams.streamingfast.io/developers-guide/substreams-sinks/substreams-sink-postgres)
- A PostgreSQL database Ready to use with [Hasura](https://hasura.io/)

### Installation
- Git clone this Repo
``` bash
cargo build --target wasm32-unknown-unknown --release
```

### Run
Get an [API key](https://substreams.streamingfast.io/reference-and-specs/authentication)
``` bash
curl -s https://auth.streamingfast.io/v1/auth/issue --data-binary '{"api_key":"your-secret-key"}'
```
``` bash
export SUBSTREAMS_API_TOKEN="your_token"
```
To test if everything is working:
``` bash
substreams run -e mainnet.eth.streamingfast.io:443 nftsubstreams.yaml db_out
```

### Populate your database
To start populating your database with NFT data you need to make some modifications:
- In the nftsubstreams.yaml ,  you can choose your desire start point with the initialBlock: xxxxxxxx (you won't be able to sink all the blockchain in dev mode so choose a StartPoint after block 500000 on Mainnet)
- Initialize your tables with your database URL (Some Database require sslmode=require at the end of the URL)
``` bash
substreams-sink-postgres setup "psql://dev-node:insecure-change-me-in-prod@localhost:5432/dev-node?slmode=require" schema/schema.sql
```
- Run the sink with your database URL ( --flush-interval 10  is a usefull flag to populate the database quickly because the sink is very long and you won't be able to sink all the blockchain in dev mode)  
##### Mainnet
``` bash
substreams-sink-postgres run "psql://dev-node:insecure-change-me-in-prod@localhost:5432/dev-node?sslmode=require" "mainnet.eth.streamingfast.io:443" "nftsubstreams.yaml" db_out --flush-interval 10 
```
##### Testnet Görli
``` bash
substreams-sink-postgres run "psql://dev-node:insecure-change-me-in-prod@localhost:5432/dev-node?sslmode=require" "goerli.eth.streamingfast.io:443" "nftsubstreams.yaml" db_out --flush-interval 10 
```
## For the React web application developpement:
### Requirement
- [Node js](https://nodejs.org/en/)
- [You need a Metamask wallet](https://metamask.io/)

### Installation
- Git clone the repo
- go in the frontend directory
``` bash
cd frontend/nfthub
```
- install all dependencies
``` bash
npm install
```

## Run
- In src/index.js change the database URL with yours:

``` js
const client = new ApolloClient({
  uri: "https://promoted-hound-24.hasura.app/v1/graphql",
  cache: new InMemoryCache(),
});
```

- To launch the wep application
``` bash
npm start
```
## Fetch NFT
Because you probably don't have NFT in your wallet on Mainnet or Testnet for test purpose your can change the fetching address of the app in src/Pages/Home.js
(soon:  you will be able to launch NFT in few clicks on Testnet on your wallet to test the app)
``` js
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
```
# WARNING
This app is in developpement so be careful when using this app on Mainnet.


