use std::str;
use base64_url;
use serde_json;
use serde_json::Value;

pub fn decode_data_url(url: String) -> String {
    let base64_str = &url[29..]; // remove the prefix

    let json = base64_url::decode(&base64_str);
    if json.is_ok() {
        let data = String::from_utf8(json.unwrap());
        if data.is_ok(){
            return data.unwrap();
        }else {
            return "".to_string(); 
        }
    } else {
        return "".to_string();
    }
}

pub fn is_valid_json(json_str: &str) -> bool {
    match serde_json::from_str::<Value>(json_str) {
        Ok(_) => true,
        Err(_) => false,
    }
}