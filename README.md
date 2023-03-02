# NFTHub

NFTHub is an open-source platform that allows users to access all their NFT data and interact with their NFTs without the need of a centralized company like OpenSea.
This application offers a web application for users and in the future, a GraphQL API for other dApps that want NFT data.
All data is indexed using Substreams technologie https://substreams.streamingfast.io/ and is accessible through a GraphQL endpoint. This first iteration only supports ETH NFTs and the MetaMask wallet.

### Requirement
- [Install Docker](https://www.docker.com/)
- [Install Rust language](https://www.rust-lang.org/)
- [Install GO](https://go.dev/learn/)
- [Install Substream CLI](https://substreams.streamingfast.io/)
- [Install GraphCLI](https://thegraph.com/docs/en/developing/creating-a-subgraph/)
- Install protobuf-compiler 
``` bash
apt install protobuf-compiler
```

### QuickStart
- Git clone this Repo
- Get an [API key](https://substreams.streamingfast.io/reference-and-specs/authentication)
``` bash
curl -s https://auth.streamingfast.io/v1/auth/issue --data-binary '{"api_key":"your-secret-key"}'
```
``` bash
export SUBSTREAMS_API_TOKEN="your_token"
export SUBSTREAMS_ENDPOINT=https://mainnet.eth.streamingfast.io:443
```
Go in the graph-node directory
``` bash
cd graph-node
./up.sh
```
Now go in another terminal and type in the root folder of the project:
``` bash
make deploy_local
```
if everything works you will see:
- GraphQL endpoint at http://127.0.0.1:8000/subgraphs/name/nftOwner
- Your PostgreSQL at localhost:8081


## For Substreams and Subgraph Developpement:
### (Optional) Populate your database with postgreSQL sink
If you don't want to use subgraph and have your own postgreSQL database you can use the substreams postgrSQL sink instead
To start populating your database with NFT data you need to make some modifications:
- In the substreams.yaml ,  you can choose your desire start point with the initialBlock: xxxxxxxx 
- Initialize your tables with your database URL (Some Database require sslmode=require at the end of the URL)
``` bash
substreams-sink-postgres setup "psql://dev-node:insecure-change-me-in-prod@localhost:5432/dev-node?slmode=require" schema/schema.sql
```
- Run the sink with your database URL ( --flush-interval 10  is a usefull flag to populate the database quickly because the sink is very long and you won't be able to sink all the blockchain in dev mode)  
##### Mainnet
``` bash
substreams-sink-postgres run "psql://dev-node:insecure-change-me-in-prod@localhost:5432/dev-node?sslmode=require" "mainnet.eth.streamingfast.io:443" "substreams.yaml" db_out --flush-interval 10 
```
##### Testnet Görli
``` bash
substreams-sink-postgres run "psql://dev-node:insecure-change-me-in-prod@localhost:5432/dev-node?sslmode=require" "goerli.eth.streamingfast.io:443" "substreams.yaml" db_out --flush-interval 10 
```
## For the React web application developpement:
### Requirement
- [Node js](https://nodejs.org/en/)
- [You need a Metamask wallet](https://metamask.io/)
- A Running graph node subgraph of this repo (See QuickStart)

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
- To launch the wep application
``` bash
npm start
```
## Tesnet
If you are on tesnet you probably don't have any NFT on your testnet Wallet. For simplicity i created a simple Pinax NFT that you can mint for free on tesnet at the address [0x55647d9B6a630452cCdd9851B72B335a82931376](https://goerli.etherscan.io/address/0x55647d9B6a630452cCdd9851B72B335a82931376)
### Mint Free NFT
- get some ETH on Goerli network https://goerlifaucet.com/
- To mint the NFT you need to compile and call the mint function yourselft to do so go to https://remix.ethereum.org/
1. Click on the import button and import the file contracts/NFTHubtestnet.sol
2. Click on it 
3. Go in the SOLIDITY COMPILER and click  on compile button
4. Go in the DEPLOY & RUN TRANSACTIONS 
5. For ENVIRONMENT Choose injected Provider Metamask
6. In the field At address insert 0x55647d9B6a630452cCdd9851B72B335a82931376 .
Click on the button At address
7. In the bottom a contract will appear click on it and use the Mint Button with your wallet address
8. You have now Mint an NFT
9. For testing purpose i suggest your substreams.yaml initialBlock number become your transaction receipt block number.
# WARNING
This app is in developpement so be careful when using this app on Mainnet.


