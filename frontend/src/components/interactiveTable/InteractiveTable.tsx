import { useEffect, useState } from "react";
import styles from "./interactiveTable.module.css";
import FiltersModal from "../modals/filtersModal/FiltersModal";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import SortModal from "../modals/filtersModal/SortModal";

interface EditableCell {
  rowIndex: number | null;
  col: string;
}

const InteractiveTable = () => {
  const [rows, setRows] = useState<Record<string, any>[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [editableCell, setEditableCell] = useState<EditableCell>({
    rowIndex: null,
    col: "",
  });
  const [newValue, setNewValue] = useState("");
  const [changes, setChanges] = useState({});
  const [filters, setFilters] = useState({ column: '', value: '' });

  const [isAddColumnModal, setIsAddColumnModal] = useState(false);
  const [isHideColumnModal, setIsHideColumnModal] = useState(false);
  const [isFilterModal, setIsFilterModal] = useState(false);
  const [isSortModal, setIsSortModal] = useState(false);
  const [isAddRowModal, setIsAddRowModal] = useState<boolean>(false);
  const [isHideColumnsModalOpen, setIsHideColumnsModalOpen] = useState<boolean>(false);
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
  const [dataType, setDataType] = useState("");

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
          `http://localhost:8080/api/table?table=${tableTitle}&page=${currentPage}`
        );
        const data = await response.json();
        setRows(data.data);
        setColumns(Object.keys(data.data[0]));
        setTotalPages(data.totalPages);
        setLoading(false);
      } catch (error) {
        console.error("Ошибка при получении данных:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, [currentPage]);

  const handleDoubleClick = (rowIndex: number, col: string, value: string) => {
    setEditableCell({ rowIndex, col });
    setNewValue(value);
  };

  const handleBlur = () => {
    const { rowIndex, col } = editableCell;
    const oldValue = rows[rowIndex!][col];
    const newValue_1 = newValue;

    if (rowIndex) {
      const updatedRows = [...rows];
      updatedRows[rowIndex - 1] = {
        ...updatedRows[rowIndex - 1],
        [col]: newValue_1,
      };
      setRows(updatedRows);
    }

    const uniqueKey = `${(rows[rowIndex!] as any).id - 1}-${col}`;

    setChanges((prev) => ({
      ...prev,
      [uniqueKey]: {
        column: col,
        oldValue: oldValue,
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

  const handleUpdateColumnType = async (col: string) => {
    try {
      const responce = await fetch("http://localhost:8080/api/type", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ table_name: tableTitle, column_name: col, new_column_type: dataType }),
      });
      if (!responce.ok) toast.error('Невозможно конвертировать в данный тип');
      setDataType("");
    } catch (e) {
      console.error(e);
    }
  };
  return (
    <div className={styles.interactiveTable}>
      <button onClick={() => { setIsFilterModal(true) }}>Фильтрация</button>
      <button onClick={() => openHideColumnsModal()}>Скрыть столбцы</button>
      <button onClick={() => { setIsSortModal(true) }}>Сортировка</button>
      <button onClick={() => { setIsAddRowModal(true) }}>Добавить строку</button>
      <div className={styles.tableWrapper}>
        <table>
          <thead>
            <tr>
              {columns.map((col, index) => (
                <td key={index}>
                  <div>  {col}</div>
                  <select value={dataType} onChange={(e) => setDataType(e.target.value)}>
                    <option value="">{dataType}</option>
                    <option value="numeric">Числовой</option>
                    <option value="text">Текст</option>
                    <option value="date">Дата</option>
                  </select>
                  <button onClick={() => handleUpdateColumnType(col)}>Изменить тип</button>
                </td>
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
                        value={newValue}
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
        <div>
          <button
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
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Вперёд
          </button>
        </div>
      </div>
      <div className={styles.actionButtons}>
        <button className={styles.button}>Отмена</button>
        <button className={styles.button} onClick={() => { saveChanges() }}>Сохранить</button>
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
      {/* {isSortModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h2>Сортировка</h2>
                        <div>
                            {columns.map((column) => (
                                <div key={column}>
                                    <span>{column}</span>
                                    <select
                                        onChange={(e) => handleSortChange(e, column.toLowerCase())}
                                        value={sortConfig.key === column.toLowerCase() ? sortConfig.direction : ''}
                                    >
                                        <option value="">Выберите сортировку</option>
                                        <option value="ascending">По возрастанию</option>
                                        <option value="descending">По убыванию</option>
                                    </select>
                                </div>
                            ))}
                        </div>
                        <button onClick={resetSorting}>Сбросить сортировку</button>
                        <button onClick={closeSortModal}>Закрыть</button>
                    </div>
                </div>
            )} */}

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
