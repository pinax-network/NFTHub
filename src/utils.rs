use std::str;
use tiny_keccak::{Hasher, Keccak};
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
