use substreams_ethereum::{pb::eth, rpc};
use crate::utils::rpc_data;
#[derive(Debug)]
pub struct RpcCallParams {
    pub to: Vec<u8>,
    pub method: String,
    pub args: Vec<Vec<u8>>,
}

pub fn fetch_many_ipfs(params: Vec<RpcCallParams>) -> Vec<Result<Vec<u8>, String>> {
    let rpc_calls = eth::rpc::RpcCalls {
        calls: params
            .iter()
            .map(|p| eth::rpc::RpcCall {
                to_addr: p.to.clone(),
                data: rpc_data(&p.method, &p.args),
            })
            .collect(),
    };

    let array = rpc::eth_call(&rpc_calls)
   .responses
   .iter()
   .enumerate()
   .map(|(i, r)| {
       if r.failed {
           Err(format!("eth_call failed: {:?}", params[i]))
       } else {
           Ok(r.raw.clone())
       }
   })
   .collect(); 
    return array
}



pub fn fetch_ipfs(param: RpcCallParams) -> Result<Vec<u8>, String> {
    return fetch_many_ipfs(vec![param]).into_iter().next().unwrap();
}
