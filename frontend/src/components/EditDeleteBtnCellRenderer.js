import {Link} from "react-router-dom"
import {
  Button
} from "@material-ui/core";

const EditDeleteBtnCellRenderer = props => {
  return (<>
    <Link 
      style={{textDecoration: "none", color: "black"}} 
      to={`/${props.linkType}/${props.data.id}`}
      state={{...props.data}}
    >
      <Button variant="outlined" color="primary">{props.editTitle}</Button>
    </Link>
    <Button onClick={props.onClickDelete(props.data)} variant="outlined" color="primary">{props.deleteTitle}</Button>
  </>);
}

export default EditDeleteBtnCellRenderer;
