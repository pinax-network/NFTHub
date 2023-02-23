use substreams::store::{ self, DeltaProto };
use substreams_entity_change::pb::entity::{ entity_change::Operation, EntityChanges };
use substreams::pb::substreams::store_delta::Operation as OperationDelta;
use crate::pb::erc721::NftOwner;

pub fn nftOwner_to_entities_changes(
    changes: &mut EntityChanges,
    deltas: store::Deltas<DeltaProto<NftOwner>>
) {
    for delta in deltas.deltas {
        match delta.operation {
            OperationDelta::Create => {
                changes
                    .push_change("nft", &delta.key, 1, Operation::Create)
                    .change("owneraddress", delta.new_value.owner)
                    .change("contract_address", delta.new_value.contract_address)
                    .change("tokenid", delta.new_value.token_id)
                    .change("metadata_url", delta.new_value.metadata_url)
                    .change("name", delta.new_value.metadata.clone().unwrap().name)
                    .change("image", delta.new_value.metadata.clone().unwrap().image)
                    .change("attributes", delta.new_value.metadata.clone().unwrap().attributes)
                    .change("txhash", delta.new_value.txhash);
            }

            OperationDelta::Update => {
                changes
                    .push_change("nft", &delta.key, 1, Operation::Update)
                    .change("owneraddress", delta.new_value.owner)
                    .change("contract_address", delta.new_value.contract_address)
                    .change("tokenid", delta.new_value.token_id)
                    .change("metadata_url", delta.new_value.metadata_url)
                    .change("name", delta.new_value.metadata.clone().unwrap().name)
                    .change("image", delta.new_value.metadata.clone().unwrap().image)
                    .change("attributes", delta.new_value.metadata.clone().unwrap().attributes)
                    .change("txhash", delta.new_value.txhash);
            }
            _ => (),
        }
    }
}