import os
import shutil

#create a dir metadata in the contracts folder


# specify input file name
input_file = "0.png"

# specify number of copies to make
x = 400

# specify destination folder
destination_folder = "images"

# create destination folder if it does not exist
if not os.path.exists(destination_folder):
    os.makedirs(destination_folder)

# loop through range x to create copies of input file with sequential names
for i in range(x):
    output_file = os.path.join(destination_folder, str(i) + ".png")
    shutil.copy(input_file, output_file)