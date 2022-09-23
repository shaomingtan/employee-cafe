import {
  Dialog,
  Button,
  DialogActions,
  DialogTitle,
} from "@material-ui/core";

const DeletePopUp = ({openDialog, handleConfirm, handleCancel, deleteItemName}) => {
  return (
    <Dialog
      open={openDialog}
      onClose={handleCancel}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        {`Confirm Delete ${deleteItemName}?`}
      </DialogTitle>
      <DialogActions>
        <Button onClick={handleConfirm}>Confirm</Button>
        <Button onClick={handleCancel}>Cancel</Button>
      </DialogActions>
    </Dialog>
  )
}

export default DeletePopUp