mod abi;
mod pb;

use pb::erc721;
use pb::erc721::Transfer;
use pb::erc721::Transfers;

use substreams::log;
use substreams::Hex;
use substreams::store::StoreGet;
use substreams::errors::Error;
use substreams::store::StoreGetProto;
use substreams::store::StoreNew;
use substreams::store::StoreSet;
use substreams::store::StoreSetProto;
use substreams_ethereum::pb::eth::v2 as eth;
use substreams_ethereum::Event;
use abi::erc721::events::Transfer as ERC721TransferEvent;
use substreams_database_change::pb::database::{table_change::Operation, DatabaseChanges};



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
                return vec![new_erc721_transfer(hash, event, Hex(&log.address).to_string() )];
            }

            vec![]
        })
    })
}

fn new_erc721_transfer(hash: &[u8],event: ERC721TransferEvent,contract: String) -> Transfer {
    log::info!("Transfer:\n from: {} \n to: {} \n Contract: {} \n token_id: {} \n ",Hex(&event.from).to_string(),Hex(&event.to).to_string(),contract, event.token_id.to_string());
    Transfer {
        contract_address: contract, 
        from: Hex(&event.from).to_string(),
        to: Hex(&event.to).to_string(),
        token_id: event.token_id.to_string(),
        trx_hash: Hex(hash).to_string(),
    }
}

#[substreams::handlers::store]
fn store_NftOwner(transfers: pb::erc721::Transfers,s: StoreSetProto<erc721::NftOwner>) {
    if transfers.transfers.len() > 0
     {
        for transfer in transfers.transfers {
            let key = transfer.contract_address.clone() + ":" + &transfer.token_id;
            let data = erc721::NftOwner{owner:transfer.to.clone(),contract_address:transfer.contract_address.clone(),token_id:transfer.token_id.clone()};
            s.set(1,key,&data);
        }
     }
   
}

#[substreams::handlers::map]
pub fn db_out(
    
   transfers : erc721::Transfers
) -> Result<DatabaseChanges, Error> {
    let mut database_changes: DatabaseChanges = Default::default();

    if transfers.transfers.len() > 0{
        for transfer in transfers.transfers{
           let key = transfer.contract_address.clone() + ":" + &transfer.token_id;

            if transfer.from == "0000000000000000000000000000000000000000".to_string()
            {
                log::info!("CREATE");
                database_changes.push_change("nft", &key,1, Operation::Create)
                .change("owneraddress", (None,transfer.to.clone()))
                .change("contract_address", (None,transfer.contract_address.clone()))
                .change("tokenid", (None,transfer.token_id.clone()))
                .change("txhash", (None,transfer.trx_hash.clone()));
            }else{
                log::info!("update");
                database_changes.push_change("nft", &key,1, Operation::Update)
                .change("owneraddress", (None,transfer.to.clone()))
                .change("txhash", (None,transfer.trx_hash.clone()));
            }

            
        }
    }
    
   
    Ok(database_changes)
}


