import React from "react";
import { copy } from "../helper/copy.js";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import IconButton from "@mui/material/IconButton";
export default function CopyIconButton({ font, text }) {
  return (
    <IconButton onClick={() => copy(text)}>
      <ContentCopyIcon className={font} />
    </IconButton>
  );
}
