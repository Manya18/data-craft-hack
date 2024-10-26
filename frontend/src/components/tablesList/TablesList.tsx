import React, { useState, ChangeEvent, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TableItem from "./TableItem";
import styles from "./TablesList.module.css"

type Table = {
  user_id: string;
  table_name: string;
};

const TablesList: React.FC = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [trigger, setTrigger] = useState('');
  console.log("ds", sessionStorage.getItem("userID"));
  const user_id = sessionStorage.getItem("userID");

  useEffect(() => {
    const fetchTables = async () => {
      if (user_id) {
        try {
          const response = await fetch(
            `http://localhost:8080/api/tables?user_id=${user_id}`
          );
          if (!response.ok) throw new Error("Trouble");
          const tablesData = await response.json();
          setTables(tablesData);
        } catch (error) {
          console.error(error);
        }
      }
    };
    fetchTables();
  }, [user_id, trigger]);

  const handleImportFile = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: string
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    fetch(
      `http://localhost:8080/api/upload${type}/${sessionStorage.getItem(
        "userID"
      )}`,
      {
        method: "POST",
        body: formData,
      }
    )
      .then((response) => response.text())
      .then((data) => {
        console.log(data);
        setTrigger(data);
    });
  };

  return (
    <div className={styles.tablesListPage}>
      <h3>Загруженные таблицы</h3>
      <div className={styles.tableListWrapper}>
        <ul className={styles.tablesList}>
            {tables.map((table) => (
                <TableItem key={table.table_name} tableName={table.table_name} setTrigger={setTrigger}/>
            ))}
        </ul>
        <div className={styles.importFileGroup}>
            <label>
            Загрузить JSON файл
            <input
                type="file"
                accept=".json"
                onChange={(e) => handleImportFile(e, "JSON")}
            />
            </label>
            <label>
            Загрузить CSV файл
            <input
                type="file"
                accept=".csv"
                onChange={(e) => handleImportFile(e, "CSV")}
            />
            </label>
        </div>
        </div>

      
    </div>
  );
};

export default TablesList;
