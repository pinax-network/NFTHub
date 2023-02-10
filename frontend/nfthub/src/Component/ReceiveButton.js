import React, { useContext } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import CloseIcon from "@mui/icons-material/Close";
import { IconButton } from "@mui/material";
import appContext from "../Context/AppState";
import QRCode from "react-qr-code";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import CopyIconButton from "./CopyIconButton";
export default function ReceiveButton({ open, setOpen }) {
  const appstate = useContext(appContext);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Button
        onClick={handleClickOpen}
        className="rounded-lg w-52 h-14 bg-blue-700 hover:bg-gray-800 mx-5  text-white  flex justify-center items-center "
        variant="contained"
        startIcon={<ArrowDownwardIcon></ArrowDownwardIcon>}
      >
        Receive
      </Button>
      <Dialog
        fullWidth={true}
        maxWidth={"md"}
        open={open}
        onClose={handleClose}
      >
        <DialogTitle>
          Receive
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
          <div className="flex justify-center items-center flex-col ">
            <div className=" flex justify-center items-center">
              <QRCode value={appstate.state_address || ""} />
            </div>

            <div className=" p-5 border flex w-1/2 justify-between items-center border-gray-600 my-10">
              {appstate.state_address}
              <CopyIconButton
                text={appstate.ref_address.current}
                font="text-blue-600 text-xl"
              ></CopyIconButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
