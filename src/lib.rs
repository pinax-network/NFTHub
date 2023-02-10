mod abi;
mod pb;
pub mod rpc;
pub mod utils;

use pb::erc721;
use pb::erc721::Transfer;
use pb::erc721::Transfers;

use abi::erc721::events::Transfer as ERC721TransferEvent;
use num_bigint::BigUint;
use num_traits::Num;
use rpc::RpcCallParams;
use substreams::errors::Error;
use substreams::log;
use substreams::store::StoreAdd;
use substreams::store::StoreAddInt64;
use substreams::store::StoreGet;
use substreams::store::StoreGetInt64;
use substreams::store::StoreNew;
use substreams::Hex;
use substreams_database_change::pb::database::{table_change::Operation, DatabaseChanges};
use substreams_ethereum::pb::eth::v2 as eth;
use substreams_ethereum::Event;

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
                return vec![new_erc721_transfer(
                    hash,
                    event,
                    Hex(&log.address).to_string(),
                )];
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
fn store_nbTransfers(transfers: pb::erc721::Transfers, s: StoreAddInt64) {
    if transfers.transfers.len() > 0 {
        for transfer in transfers.transfers {
            let key = transfer.contract_address.clone() + ":" + &transfer.token_id;
            s.add(1, &key, 1);
        }
    }
}

#[substreams::handlers::map]
pub fn db_out(s: StoreGetInt64, transfers: erc721::Transfers) -> Result<DatabaseChanges, Error> {
    let mut database_changes: DatabaseChanges = Default::default();
    let mut ipfs_url = "".to_string();

    if transfers.transfers.len() > 0 {
        for transfer in transfers.transfers {
            let param = RpcCallParams {
                to: Hex::decode(transfer.contract_address.clone()).unwrap(),
                method: "tokenURI(uint256)".to_string(),
                args: vec![<BigUint as Num>::from_str_radix(&transfer.token_id, 10)
                    .expect("error")
                    .to_bytes_be()],
            };

            let metadata = rpc::fetch_ipfs(param);
            let key = transfer.contract_address.clone() + ":" + &transfer.token_id;
            let exist = s.get_last(&key).unwrap();

            if metadata.is_ok() {
                let test_utf8 = String::from_utf8(metadata.unwrap());
                if !test_utf8.is_err() {
                    let rawdata = test_utf8.unwrap();
                    ipfs_url = rpc::clean_url(rawdata);
                }
            }
            if exist == 1 {
                database_changes
                    .push_change("nft", &key, 1, Operation::Create)
                    .change("owneraddress", (None, transfer.to.clone()))
                    .change("metadata", (None, ipfs_url.clone()))
                    .change(
                        "contract_address",
                        (None, transfer.contract_address.clone()),
                    )
                    .change("tokenid", (None, transfer.token_id.clone()))
                    .change("txhash", (None, transfer.trx_hash.clone()));
            } else {
                database_changes
                    .push_change("nft", &key, 1, Operation::Update)
                    .change("owneraddress", (None, transfer.to.clone()))
                    .change("metadata", (None, ipfs_url.clone()))
                    .change("txhash", (None, transfer.trx_hash.clone()));
            }
        }
    }

    Ok(database_changes)
}
