import React, { useEffect, useState } from "react";
import { Snackbar } from "@material-ui/core";
import store from "../ReduxStore";

const SnackBar = () => {
  const [message, showMessage] = useState("");

  useEffect(() => {
    const unsub = store.subscribe(() => {
      if (store.getState().message) {
        showMessage(store.getState().message);
        setTimeout(() => {
          store.dispatch({ type: "showMessage", payload: "" });
          showMessage("");
        }, 3000);
      }
    });
    return unsub;
  }, []);

  return (
    <Snackbar 
      open={message != ""} 
      message={message}
    />
  );
};

export default SnackBar;
