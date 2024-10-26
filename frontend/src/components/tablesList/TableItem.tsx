import { useState } from "react";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import styles from "./TablesList.module.css";

const TableItem = ({ tableName, setTrigger }: { tableName: string, setTrigger : (trigger: string) => void }) => {
  const [isEdit, setIsEdit] = useState(false);
  const [tableTitle, setTableTitle] = useState(tableName);

  const editTableTitle = async () => {
    if (isEdit && tableName !== tableTitle) {
      console.log("ediiit");
      try {
        await fetch("http://localhost:8080/api/table", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            old_table_name: tableName,
            new_table_name: tableTitle.toLowerCase(),
          }),
        });
        setTrigger(tableTitle);
      } catch (e) {
        console.error(e);
      }
    }
    setIsEdit(!isEdit);
  };

  const deleteTable = async () => {
    if (tableName) {
      try {
        await fetch("http://localhost:8080/api/table", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            table_name: tableName,
          }),
        });
        setTrigger(tableTitle);
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <li className={styles.tableItem}>
      {isEdit ? (
        <input
          title="Перейти"
          className={styles.tableTitleInput}
          type="text"
          value={tableTitle.toLowerCase()}
          onChange={(e) => setTableTitle(e.target.value)}
        ></input>
      ) : (
        <a className={styles.tableTitle} href={`/table/${tableName}`}>
          {tableTitle}
        </a>
      )}
      <button
        title="Переименовать"
        className={styles.actionButton}
        onClick={editTableTitle}
      >
        {isEdit ? <SaveIcon /> : <EditIcon />}
      </button>
      <button
        title="Удалить"
        className={styles.actionButton}
        onClick={() => {
          deleteTable();
        }}
      >
        <DeleteIcon />
      </button>
    </li>
  );
};

export default TableItem;
