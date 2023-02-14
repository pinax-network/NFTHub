
import os
import json
#run this script in the folder contracts
if os.path.exists("metadata/1.json"):
    print("The file 1.json exists in the current directory.")
else:
    print("The file 1.json does not exist in the current directory.") 

num_copies = 50

for i in range(1, num_copies + 1):
    with open("metadata/1.json", "r") as file:
        data = json.load(file)
        data["name"] = f"Pinax testnet {i + 1}"

    with open(f"metadata/{i + 1}.json", "w") as file:
        json.dump(data, file)