use std::str;
use base64_url;
use substreams::log;
use tiny_keccak::{ Hasher, Keccak };
use serde_json;
use serde_json::Value;

fn method_signature(method: &str) -> Vec<u8> {
    let mut keccak = Keccak::v256();
    let mut output = [0u8; 32];
    keccak.update(&Vec::from(method));
    keccak.finalize(&mut output);
    return output[..4].to_vec();
}

pub fn rpc_data(method: &str, args: &Vec<Vec<u8>>) -> Vec<u8> {
    let method_sig = method_signature(method);
    if args.len() == 0 {
        return method_sig;
    }
    let mut data = Vec::with_capacity(8 + args.len() * 32);
    data.extend(method_sig);
    for arg in args {
        if arg.len() <= 32 {
            data.extend(vec![0u8].repeat(32 - arg.len()));
        } else {
        }

        data.extend(arg);
    }
    return data;
}

pub fn decode_data_url(url: String) -> String {
    let base64_str = &url[29..]; // remove the prefix

    let json = base64_url::decode(&base64_str);
    if json.is_ok() {
        return String::from_utf8(json.unwrap()).unwrap();
    } else {
        log::info!("mat {}", base64_str.to_string());
        log::info!("erreur decode");
        return "".to_string();
    }
}

pub fn is_valid_json(json_str: &str) -> bool {
    match serde_json::from_str::<Value>(json_str) {
        Ok(_) => true,
        Err(_) => false,
    }
}