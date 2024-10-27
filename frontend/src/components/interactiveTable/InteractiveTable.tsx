import { useEffect, useState } from "react";
import styles from "./interactiveTable.module.css";
import FiltersModal from "../modals/filtersModal/FiltersModal";
import SortModal from "../modals/sortModal/sortModal";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import TableHeadCell from "./TableHeadSell";
// import SortModal from "../modals/filtersModal/SortModal";

interface EditableCell {
  rowIndex: number | null;
  col: string;
}

interface columnsType {
  column_name: string,
  data_type: string
}

const InteractiveTable = () => {
  const [rows, setRows] = useState<Record<string, any>[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [columnsType, setColumnsType] = useState<columnsType[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [editableCell, setEditableCell] = useState<EditableCell>({
    rowIndex: null,
    col: "",
  });
  const [newValue, setNewValue] = useState<string | null>("");
  const [changes, setChanges] = useState({});
  const [filters, setFilters] = useState({ column: '', value: '' });

  const [isAddColumnModal, setIsAddColumnModal] = useState(false);
  const [isHideColumnModal, setIsHideColumnModal] = useState(false);
  const [isFilterModal, setIsFilterModal] = useState(false);
  const [isSortModal, setIsSortModal] = useState(false);
  const [isHideColumnsModalOpen, setIsHideColumnsModalOpen] = useState<boolean>(false);
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
  const [dataType, setDataType] = useState("");

  const [sortOrder, setSortOrder] = useState<string>('');
  const [orderBy, setOrderBy] = useState<string>('');

  function getParameterFromUrl() {
    const url = window.location.href;
    const urlParts = url.split('/');
    const parameter = urlParts[urlParts.length - 1];
    return parameter;
  }

  const tableTitle = getParameterFromUrl();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:8080/api/table?table=${tableTitle}${filters.column ? ('&filters=[' + JSON.stringify(filters) + ']') : ''}&page=${currentPage}${sortOrder ? ('&sortOrder=' + sortOrder) : ''}${orderBy ? ('&sortBy=' + orderBy) : ''}`

        );
        const data = await response.json();
        console.log(data.data);
        setRows(data.data);
        setColumns(Object.keys(data.data[0]));
        setTotalPages(data.totalPages);
        setLoading(false);
      } catch (error) {
        console.error("Ошибка при получении данных:", error);
        setLoading(false);
      }
    };

    const fetchColumns = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/api/columnsType?table=${tableTitle}`
        );
        const data = await response.json();
        setColumnsType(data)
      } catch (error) {
        console.error("Ошибка при получении данных:", error);
      }
    };
    fetchData();
    fetchColumns();
  }, [currentPage, filters, orderBy, sortOrder]);

  const handleDoubleClick = (rowIndex: number, col: string, value: string | null) => {
    setEditableCell({ rowIndex, col });
    setNewValue(value);
  };

  const handleBlur = () => {
    const { rowIndex, col } = editableCell;
    const newValue_1 = newValue;
  
    console.log('rows', rows);
  
    if (rowIndex !== null) {
      const updatedRows = rows.map(row => {
        if (row.id === rowIndex) {
          return {
            ...row,
            [col]: newValue_1,
          };
        }
        return row;
      });
  
      console.log('updatedRows', updatedRows);
      setRows(updatedRows);
    }
  
    const uniqueKey = `${rowIndex}-${col}`;
  
    setChanges((prev) => ({
      ...prev,
      [uniqueKey]: {
        column: col,
        newValue: newValue_1,
      },
    }));
  
    setEditableCell({ rowIndex: null, col: "" });
    setNewValue(""); 
  };

  const saveChanges = async () => {
    console.log(changes)
    try {
      await fetch("http://localhost:8080/api/cell", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ changes: changes, table_name: tableTitle }),
      });
      setChanges([]);
      // setTrigger(tableTitle);
    } catch (e) {
      console.error(e);
    }
  }

  const addRow = async () => {
    try {
      await fetch("http://localhost:8080/api/row", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ table_name: tableTitle }),
      });
      setOrderBy('id');
      setSortOrder('desc');
      setChanges([]);
    } catch (e) {
      console.error(e);
    }
  }

  const handleCheckboxChange = (e: any, column: string) => {
    if (e.target.checked) {
      setHiddenColumns(hiddenColumns.filter(col => col !== column));
    } else {
      setHiddenColumns([...hiddenColumns, column]);
    }
  };
  const closeHideColumnsModal = () => {
    setIsHideColumnsModalOpen(false);
  };
  const openHideColumnsModal = () => {
    setIsHideColumnsModalOpen(true);
  };

  return (
    <div className={styles.interactiveTable}>
      <div className={styles.buttonGroup}>
        <div className={styles.left}>
          <button className="outlined-button" onClick={() => { setIsFilterModal(true) }}>Фильтрация</button>
          <button className="outlined-button" onClick={() => openHideColumnsModal()}>Скрыть столбцы</button>
          <button className="outlined-button" onClick={() => { setIsSortModal(true) }}>Сортировка</button>
          <button className="outlined-button" onClick={() => { addRow() }}>Добавить строку</button>
        </div>
        <div className={styles.right}>
          <button className="primary-button" >Отмена</button>
          <button className="primary-button" onClick={() => { saveChanges() }}>Сохранить</button>
        </div>
      </div>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columnsType.map((col, index) => (
                <TableHeadCell key={index} col={col} tableName={tableTitle}></TableHeadCell>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={(row as any).id}>
                {columns.map((col, colIndex) => (
                  <td
                    key={colIndex}
                    onDoubleClick={() =>
                      handleDoubleClick((row as any).id, col, row[col])
                    }
                  >
                    {editableCell.rowIndex === (row as any).id &&
                      editableCell.col === col ? (
                      <input
                        type="text"
                        value={newValue ? newValue : ''}
                        onChange={(e) => setNewValue(e.target.value)}
                        onBlur={handleBlur}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            handleBlur();
                          }
                        }}
                        autoFocus
                      />
                    ) : (
                      row[col]
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className={styles.pagination}>
          <button
            className="primary-button"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Назад
          </button>
          <span>
            {" "}
            Страница {currentPage} из {totalPages}{" "}
          </span>
          <button
            className="primary-button"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Вперёд
          </button>
        </div>
      </div>

      {/* Модальное окно для скрытия столбцов */}
      {/* {isHideColumnModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h2>Скрыть столбцы</h2>
                        {columns.map(column => (
                            <div key={column}>
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={!hiddenColumns.includes(column)}
                                        onChange={(e) => handleCheckboxChange(e, column)}
                                    />
                                    {column}
                                </label>
                            </div>
                        ))}
                        <button onClick={closeHideColumnsModal}>Закрыть</button>
                    </div>
                </div>
            )} */}

      {/* Модальное окно для фильтрации */}
      {isFilterModal && (
        <FiltersModal columns={columns} table={tableTitle} setIsFilterModal={setIsFilterModal} setFilters={setFilters}></FiltersModal>
      )}
      {/* 
{isSortModal && (
        <SortModal columns={columns} table={tableTitle} setIsSortModal={setIsSortModal} setModal={setModals}></SortModal>
      )} */}
      {/* Модальное окно сортировки */}
      {isSortModal && (
        <SortModal columns={columns} table={tableTitle} setIsSortModal={setIsSortModal} setSortOrder={setSortOrder} setOrderBy={setOrderBy}></SortModal>
      )}


      {/* Модальное окно для добавления строки */}
      {/* {isAddRowModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h2>Добавить новую строку</h2>
                        <div className={styles.modalInput}>
                            {columns.map((column) => (
                                <div key={column} className={styles.modalInput}>
                                    <label>{column}</label>
                                    <input
                                        type="text"
                                        value={newRowData[column.toLowerCase()] || ''}
                                        onChange={(e) => handleNewRowDataChange(column, e.target.value)}
                                    />
                                </div>
                            ))}
                        </div>
                        <button onClick={addRow}>{t(`table.add`)}</button>
                        <button onClick={closeAddRowModal}>Закрыть</button>
                    </div>
                </div>
            )} */}
      <ToastContainer />

    </div>
  );
};

export default InteractiveTable;
