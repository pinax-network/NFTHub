mod abi;
mod pb;
pub mod rpc;
pub mod utils;
#[path = "graph_out.rs"]
mod graph;

use pb::erc721;
use pb::erc721::Metadata;
use pb::erc721::NftOwner;
use pb::erc721::Transfer;
use pb::erc721::Transfers;
use abi::erc721::events::Transfer as ERC721TransferEvent;
use num_bigint::BigUint;
use num_traits::Num;
use rpc::RpcCallParams;
use substreams::errors::Error;
use substreams::log;
use substreams::store::Deltas;
use substreams::store::DeltaProto;
use substreams::pb::substreams::store_delta::Operation as OperationDelta;
use substreams::store::StoreSet;
use substreams::store::StoreSetProto;
use substreams::store::StoreNew;
use substreams::Hex;
use substreams_database_change::pb::database::{ table_change::Operation, DatabaseChanges };
use substreams_ethereum::pb::eth::v2 as eth;
use substreams_ethereum::Event;
use substreams_entity_change::pb::entity::EntityChanges;
use serde_json::Value;
use serde_json;
use serde::{ Serialize, Deserialize };
#[substreams::handlers::map]
fn map_nfttransfers(blk: eth::Block) -> Result<Transfers, substreams::errors::Error> {
    Ok(Transfers {
        transfers: get_transfers(&blk).collect(),
    })
}

fn get_transfers<'a>(blk: &'a eth::Block) -> impl Iterator<Item = Transfer> + 'a {
    blk.receipts().flat_map(|receipt| {
        let hash = &receipt.transaction.hash;
        receipt.receipt.logs.iter().flat_map(|log| {
            if let Some(event) = ERC721TransferEvent::match_and_decode(log) {
                return vec![new_erc721_transfer(hash, event, Hex(&log.address).to_string())];
            }

            vec![]
        })
    })
}

fn new_erc721_transfer(hash: &[u8], event: ERC721TransferEvent, contract: String) -> Transfer {
    log::info!(
        "Transfer:\n from: {} \n to: {} \n Contract: {} \n token_id: {} \n ",
        Hex(&event.from).to_string(),
        Hex(&event.to).to_string(),
        contract,
        event.token_id.to_string()
    );
    Transfer {
        contract_address: contract,
        from: Hex(&event.from).to_string(),
        to: Hex(&event.to).to_string(),
        token_id: event.token_id.to_string(),
        trx_hash: Hex(hash).to_string(),
    }
}

#[substreams::handlers::store]
fn store_nftOwner(transfers: pb::erc721::Transfers, s: StoreSetProto<erc721::NftOwner>) {
    log::info!("store:");
    if transfers.transfers.len() > 0 {
        for transfer in transfers.transfers {
            let mut ipfs_url = "".to_string();
            let mut json_data = "".to_string();
            let mut name = "".to_string();
            let mut description = "".to_string();
            let mut image = "".to_string();
            let mut attributes = "".to_string();
            let param = RpcCallParams {
                to: Hex::decode(transfer.contract_address.clone()).unwrap(),
                method: "tokenURI(uint256)".to_string(),
                args: vec![
                    <BigUint as Num>
                        ::from_str_radix(&transfer.token_id, 10)
                        .expect("error")
                        .to_bytes_be()
                ],
            };

            let metadata = rpc::fetch_ipfs(param);
            log::info!("metadata:");
            if metadata.is_ok() {
                log::info!("ok:");
                let test_utf8 = String::from_utf8(metadata.unwrap());
                if !test_utf8.is_err() {
                    let rawdata = test_utf8.unwrap();
                    ipfs_url = rpc::clean_url(rawdata);
                    log::info!("ipfs:{}", ipfs_url.clone());
                }
            }
            if ipfs_url.len() > 4 {
                if &ipfs_url[0..4] == "data" {
                    json_data = utils::decode_data_url(ipfs_url.clone());
                }
            }

            if json_data != "" && utils::is_valid_json(&json_data) {
                let json_value: Value = serde_json::from_str(&json_data).unwrap();

                name = json_value["name"].to_string();
                log::info!("name: {}", name);
                description = json_value["description"].to_string();
                image = json_value["image"].to_string();
                attributes = json_value["attributes"].to_string();
            }

            let key = transfer.contract_address.clone() + ":" + &transfer.token_id;
            let metadata = Metadata {
                name: name,
                description: description,
                image: image.clone(),
                attributes: attributes,
            };

            s.set(
                0,
                key,
                &(NftOwner {
                    owner: transfer.to,
                    contract_address: transfer.contract_address,
                    token_id: transfer.token_id,
                    metadata_url: ipfs_url,
                    metadata: Some(metadata),
                    txhash: transfer.trx_hash,
                })
            );
        }
    }
}

#[derive(Serialize, Deserialize)]
struct StringMetadata {
    name: String,
    description: String,
    image: String,
    attributes: String,
}

#[substreams::handlers::map]
pub fn db_out(store: Deltas<DeltaProto<erc721::NftOwner>>) -> Result<DatabaseChanges, Error> {
    let mut database_changes: DatabaseChanges = Default::default();

    for delta in store.deltas {
        let mut metadata = "".to_string();
        if delta.new_value.metadata.is_some() {
            let data = delta.new_value.metadata.clone().unwrap();
            let data_struct = StringMetadata {
                name: data.name,
                description: data.description,
                image: data.image,
                attributes: data.attributes,
            };
            metadata = serde_json::to_string(&data_struct).unwrap();
        }
        match delta.operation {
            OperationDelta::Create => {
                database_changes
                    .push_change("nft", &delta.key, 1, Operation::Create)
                    .change("owneraddress", (None, delta.new_value.owner))
                    .change("contract_address", (None, delta.new_value.contract_address))
                    .change("tokenid", (None, delta.new_value.token_id))
                    .change("metadata_url", (None, delta.new_value.metadata_url))
                    .change("metadata_json", (None, metadata))
                    .change("name", (None, delta.new_value.metadata.clone().unwrap().name))
                    .change("image", (None, delta.new_value.metadata.clone().unwrap().image))
                    .change("attributes", (
                        None,
                        delta.new_value.metadata.clone().unwrap().attributes,
                    ))
                    .change("txhash", (None, delta.new_value.txhash));
            }

            OperationDelta::Update => {
                database_changes
                    .push_change("nft", &delta.key, 1, Operation::Update)
                    .change("owneraddress", (None, delta.new_value.owner))
                    .change("contract_address", (None, delta.new_value.contract_address))
                    .change("tokenid", (None, delta.new_value.token_id))
                    .change("metadata_url", (None, delta.new_value.metadata_url))
                    .change("metadata_json", (None, metadata))
                    .change("name", (None, delta.new_value.metadata.clone().unwrap().name))
                    .change("image", (None, delta.new_value.metadata.clone().unwrap().image))
                    .change("attributes", (
                        None,
                        delta.new_value.metadata.clone().unwrap().attributes,
                    ))
                    .change("txhash", (None, delta.new_value.txhash));
            }
            _ => (),
        }
    }

    Ok(database_changes)
}

#[substreams::handlers::map]
pub fn graph_out(store: Deltas<DeltaProto<erc721::NftOwner>>) -> Result<EntityChanges, Error> {
    let mut entity_changes: EntityChanges = Default::default();
    graph::nftOwner_to_entities_changes(&mut entity_changes, store);
    Ok(entity_changes)
}