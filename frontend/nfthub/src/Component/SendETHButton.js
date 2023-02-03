import React, { useContext, useRef, useState } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import CloseIcon from "@mui/icons-material/Close";
import { IconButton } from "@mui/material";
import appContext from "../Context/AppState";
import { ethers } from "ethers";
export default function SendETHButton({ open, setOpen }) {
  const appstate = useContext(appContext);
  const addressTosend = useRef("");
  const amount = useRef(0);
  const [errorAddress, setErrorAddress] = useState(false);
  const [errorAmount, setErrorAmount] = useState(false);
  const [canSend, setCanSend] = useState(false);

  const [transactionid, SetTransactionId] = useState("");
  const [transactionConfirm, setTransactionConfirm] = useState(false);
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  async function verifyInput() {
    let valid = true;

    console.log(amount.current);
    console.log(parseFloat(amount.current) === 0);
    if (
      amount.current >= appstate.ref_balance.current ||
      parseFloat(amount.current) === 0
    ) {
      setErrorAmount(true);
      valid = false;
    } else {
      setErrorAmount(false);
    }
    if (!ethers.utils.isAddress(addressTosend.current)) {
      setErrorAddress(true);
      valid = false;
    } else {
      setErrorAddress(false);
    }

    if (valid) setCanSend(true);
    else setCanSend(false);
  }

  async function sendEth() {
    const signer = appstate.ref_provider.current.getSigner();
    const tx = {
      to: addressTosend.current,
      value: ethers.utils.parseEther(amount.current, "ether"),
    };

    const transaction = await signer.sendTransaction(tx);
    SetTransactionId(transaction.hash);
    confirmTransaction(transaction.hash);
  }

  async function confirmTransaction(hash) {
    let receipt = false;
    while (!receipt) {
      receipt = await appstate.ref_provider.current.getTransactionReceipt(hash);
      setTransactionConfirm(false);
    }

    setTransactionConfirm(true);
  }
  return (
    <div>
      <Button
        onClick={handleClickOpen}
        className="rounded-lg w-52 h-14 bg-blue-700 hover:bg-gray-800 mx-5  text-white  flex justify-center items-center "
        variant="contained"
        startIcon={<ArrowOutwardIcon></ArrowOutwardIcon>}
      >
        Send
      </Button>
      <Dialog
        fullWidth={true}
        maxWidth={"md"}
        open={open}
        onClose={handleClose}
      >
        <DialogTitle>
          Send ETH
          <IconButton
            aria-label="close"
            onClick={() => setOpen(false)}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>Address</DialogContentText>
          <TextField
            autoFocus
            error={errorAddress}
            margin="dense"
            id="address"
            label="Send to ...."
            placeholder="Public Address () , ENS"
            fullWidth
            variant="outlined"
            helperText={errorAddress && "Invalid address!"}
            onChange={(e) => {
              addressTosend.current = e.target.value;
              verifyInput();
            }}
          />
          <DialogContentText>Amount</DialogContentText>
          <TextField
            autoFocus
            error={errorAmount}
            margin="dense"
            id="amount"
            label="Amount"
            type="number"
            placeholder="0.000 ETH"
            fullWidth
            variant="outlined"
            helperText={
              errorAmount &&
              "Not enought ETH or Amount must be greater than 0 !"
            }
            onChange={(e) => {
              amount.current = e.target.value;
              verifyInput();
            }}
          />
          {canSend && (
            <div className="flex justify-center items-center my-6">
              <Button
                onClick={sendEth}
                className="rounded-lg w-52 h-14 bg-blue-700 hover:bg-gray-800 mx-5  text-white  flex justify-center items-center "
                variant="contained"
                startIcon={<ArrowOutwardIcon></ArrowOutwardIcon>}
              >
                Send
              </Button>
            </div>
          )}
          {transactionid !== "" && (
            <div className="border border-gray-500 rounded-md p-5 flex flex-col items-center my-2">
              <div className=" w-full flex justify-between my-2">
                <div className="text-gray-600 text-lg font-semibold">
                  Transaction Hash
                </div>
                <div className="text-gray-600 font-semibold  text-lg mr-6">
                  Status
                </div>
              </div>
              <div className="w-full justify-between items-center flex">
                <div>{transactionid}</div>
                <div className="flex justify-center items-center">
                  {transactionConfirm ? (
                    <div className="bg-green-400 rounded-lg text-white p-2 flex justify-center items-center">
                      Confirmed
                    </div>
                  ) : (
                    <div className="bg-red-400 rounded-lg text-white p-2 flex justify-center items-center">
                      Not Confirmed
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
