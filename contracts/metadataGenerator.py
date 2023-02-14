
import os
import json
# create a dir metadata in the contracts folder run this script in the folder contracts
if os.path.exists("0.json"):
    print("The file 1.json exists in the current directory.")
else:
    print("The file 1.json does not exist in the current directory.") 

num_copies = 400

for i in range(0, num_copies):
    with open("0.json", "r") as file:
        data = json.load(file)
        data["name"] = f"Pinax testnet {i}"
        data["image"] = f"ipfs://QmQUzqmyrRCdT1Zwdk81i4nGp3hhDNWCnP8BjFonx5exNa/{i}.png"

    with open(f"metadata/{i}", "w") as file:
        json.dump(data, file)