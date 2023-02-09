use substreams_ethereum::{ pb::eth, rpc };
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

    return rpc
        ::eth_call(&rpc_calls)
        .responses.iter()
        .enumerate()
        .map(|(i, r)| {
            if r.failed {
                Err(format!("eth_call failed: {:?}", params[i]))
            } else {
                Ok(r.raw.clone())
            }
        })
        .collect();
}

pub fn fetch_ipfs(param: RpcCallParams) -> Result<Vec<u8>, String> {
    return fetch_many_ipfs(vec![param]).into_iter().next().unwrap();
}

pub fn clean_url(data: String) -> String {
    if data.contains('\u{0000}') {
        let newdata = data.replace('\u{0000}', "");

        // create the matches
        let match1 = "http";
        let match2 = "ipfs";
        let match3 = "data";
        let mut index = 0;
        if newdata.find(match1).is_some() {
            index = newdata.find(match1).unwrap();
        } else if newdata.find(match2).is_some() {
            index = newdata.find(match2).unwrap();
        } else if newdata.find(match3).is_some() {
            index = newdata.find(match3).unwrap();
        }

        let clean_url = &newdata[index..];
        return clean_url.to_string();
    }
    return data;
}