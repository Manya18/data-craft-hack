import React, { useState, useEffect, useRef } from 'react';
import { FaPlus, FaSortUp, FaSortDown } from 'react-icons/fa';
import styles from "./InteractiveTable.module.css";
import { t } from 'i18next';
import Papa from 'papaparse';

interface Row {
    id: number;
    [key: string]: any;
}

interface ColumnContextMenu {
    visible: boolean;
    x: number;
    y: number;
    column: string | null;
}

interface ContextMenu {
    visible: boolean;
    x: number;
    y: number;
    row: Row | null;
}

const InteractiveTable: React.FC = () => {
    const [rows, setRows] = useState<Row[]>([]);
    const [columns, setColumns] = useState<string[]>([]);
    const [editingCell, setEditingCell] = useState<{ rowId: number; columnKey: string } | null>(null);
    const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
    const [newColumnName, setNewColumnName] = useState<string>('');
    const [newColumnType, setNewColumnType] = useState<string>('');
    const [isAddColumnModalOpen, setIsAddColumnModalOpen] = useState<boolean>(false);
    const [isHideColumnsModalOpen, setIsHideColumnsModalOpen] = useState<boolean>(false);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
    const [isSortModalOpen, setIsSortModalOpen] = useState<boolean>(false);
    const [filters, setFilters] = useState<{ [key: string]: string }>({});
    const [filteredRows, setFilteredRows] = useState<Row[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const inputRef = useRef<HTMLInputElement | null>(null);
    const dragRowIndex = useRef<number | null>(null);
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' }>({ key: '', direction: 'ascending' });
    const [draggedRowIndex, setDraggedRowIndex] = useState<number | null>(null);
    const [isAddRowModalOpen, setIsAddRowModalOpen] = useState<boolean>(false);
    const [newRowData, setNewRowData] = useState<{ [key: string]: any }>({});
    const [contextMenu, setContextMenu] = useState<ContextMenu>({ visible: false, x: 0, y: 0, row: null });
    const [columnContextMenu, setColumnContextMenu] = useState<ColumnContextMenu>({ visible: false, x: 0, y: 0, column: null });

    // useEffect(() => {
    //     const fetchData = async () => {
    //         try {
    //             const response = await fetch('http://localhost:4000/metrics');
    //             const data = await response.json();
    //             setRows(data);
    //             if (data.length > 0) {
    //                 const colNames = Object.keys(data[0]).filter(col => col !== 'id');
    //                 setColumns(colNames);
    //             }
    //         } catch (error) {
    //             console.error('Ошибка при получении данных:', error);
    //         }
    //     };
    //     fetchData();
    // }, []);

    useEffect(() => {
        let sortedRows = [...rows];
        //фильтр
        for (const [columnKey, value] of Object.entries(filters)) {
            if (value) {
                sortedRows = sortedRows.filter(row =>
                    String(row[columnKey]).toLowerCase().includes(value.toLowerCase())
                );
            }
        }

        // поиск
        if (searchQuery) {
            sortedRows = sortedRows.filter(row =>
                Object.values(row).some(val =>
                    String(val).toLowerCase().includes(searchQuery.toLowerCase())
                )
            );
        }

        setFilteredRows(sortedRows);
    }, [rows, filters, searchQuery]);

    const openAddColumnModal = () => {
        setIsAddColumnModalOpen(true);
    };

    const closeAddColumnModal = () => {
        setIsAddColumnModalOpen(false);
        setNewColumnName('');
        setNewColumnType('');
    };

    const openHideColumnsModal = () => {
        setIsHideColumnsModalOpen(true);
    };

    const closeHideColumnsModal = () => {
        setIsHideColumnsModalOpen(false);
    };

    const openFilterModal = () => {
        setIsFilterModalOpen(true);
    };

    const resetFilters = () => {
        setFilters({});
    };

    const resetSorting = () => {
        setSortConfig({ key: '', direction: 'ascending' });
        closeSortModal();
    };

    const closeFilterModal = () => {
        setIsFilterModalOpen(false);
    };

    const openSortModal = () => {
        setIsSortModalOpen(true);
    };

    const closeSortModal = () => {
        setIsSortModalOpen(false);
    };

    const addColumn = async (columnName: string, columnType: string) => {

        setColumns([...columns, newColumnName]);

        setRows(rows.map(row => ({ ...row, [newColumnName]: '' })));
        closeAddColumnModal();

    };

    const handleClick = (rowId: number, columnKey: string) => {
        setEditingCell({ rowId, columnKey });
        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.focus();
            }
        }, 0);
    };

    const handleKeyDown = (e: any, rowId: number, columnKey: string) => {
        if (e.key === 'Enter') {
            const newValue = e.target.value;
            handleEditCell(rowId, columnKey, newValue);
            setEditingCell(null);
        }

    };

    const handleCheckboxChange = (e: any, column: string) => {
        if (e.target.checked) {
            setHiddenColumns(hiddenColumns.filter(col => col !== column));
        } else {
            setHiddenColumns([...hiddenColumns, column]);
        }
    };

    const handleSortChange = (e: any, column: string) => {
        const direction = e.target.value;
        if (direction) {
            setSortConfig({ key: column, direction });
        } else {
            setSortConfig({ key: '', direction: 'ascending' });
        }
        sortData(column, direction);
    };

    const sortData = (key: any, direction: string) => {
        const sortedRows = [...rows];
        if (key) {
            sortedRows.sort((a, b) => {
                const isAsc = direction === 'ascending';
                if (a[key] < b[key]) {
                    return isAsc ? 1 : -1;
                }
                if (a[key] > b[key]) {
                    return isAsc ? -1 : 1;
                }
                return 0;
            });
        }
        setRows(sortedRows);
    };

    const handleDragStart = (index: number) => {
        dragRowIndex.current = index;
    };

    const handleDragOver = (index: number, event: any) => {
        event.preventDefault();
        setDraggedRowIndex(index);
    };

    const handleDrop = (index: number, event: any) => {
        event.preventDefault();
        if (dragRowIndex.current === null || dragRowIndex.current === index) {
            return;
        }

        const draggedRow = rows[dragRowIndex.current];
        const updatedRows = [...rows];

        updatedRows.splice(dragRowIndex.current, 1);
        updatedRows.splice(index, 0, draggedRow);
        setRows(updatedRows);
        dragRowIndex.current = null;
        setDraggedRowIndex(null);
    };

    const handleFilterChange = (columnKey: string, value: string) => {
        setFilters(prev => ({ ...prev, [columnKey]: value }));
    };

    const getUniqueValues = (columnKey: string) => {
        const uniqueValuesSet = new Set(rows.map(row => row[columnKey]));
        return Array.from(uniqueValuesSet);
    };

    const openAddRowModal = () => {
        setNewRowData({});
        setIsAddRowModalOpen(true);
    };

    const closeAddRowModal = () => {
        setIsAddRowModalOpen(false);
    };

    const addRow = async () => {
        const newRow = { id: rows.length + 1, ...newRowData };
        setRows([...rows, newRow]);
        closeAddRowModal();
    };

    const handleNewRowDataChange = (column: string, value: string) => {
        setNewRowData(prev => ({ ...prev, [column.toLowerCase()]: value }));
    };

    const handleRightClick = (e: any, row: any) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({
            visible: true,
            x: e.clientX,
            y: e.clientY,
            row: row,
        });
    };

    const handleColumnRightClick = (e: any, column: any) => {
        e.preventDefault();
        setColumnContextMenu({
            visible: true,
            x: e.clientX,
            y: e.clientY,
            column: column,
        });
    };

    const handleContextMenuClose = (e: any) => {
        e.stopPropagation();
        setContextMenu({ ...contextMenu, visible: false });
        setColumnContextMenu({ ...columnContextMenu, visible: false });
    };

    const handleDeleteRow = async (e: any) => {
        const row = contextMenu?.row;

        setRows(rows.filter(r => r.id !== row!.id));

    };


    const handleEditCell = async (rowId: number, columnKey: string, newValue: string) => {
        const rowToEdit = rows.find(row => row.id === rowId);
        if (!rowToEdit) {
            console.error('Ошибка: строка не найдена для редактирования.');
            return;
        }
        const updatedRow: Row = { ...rowToEdit, [columnKey]: newValue };
        setRows((prevRows) => prevRows.map(row => (row.id === rowId ? updatedRow : row)));

    };


    const handleDeleteColumn = async (e: React.MouseEvent) => {
        const columnKey = columnContextMenu.column;
        setColumns(columns.filter(col => col !== columnKey));
        setRows(rows.map((row: Row) => {
            const { [columnKey!]: _, ...rest } = row;
            return { ...rest, id: row.id };
        }));
        handleContextMenuClose(e);
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const text = await file.text();
            const jsonData = JSON.parse(text);

            if (Array.isArray(jsonData)) {
                const rows = jsonData.map((item, index) => ({ id: index + 1, ...item }))
                setRows(rows);
                // Извлекаем названия столбцов из первого объекта
                const newColumns = Object.keys(jsonData[0] || {});
                setColumns(newColumns);
            } else {
                console.error("Формат файла не поддерживается. Ожидается массив объектов.");
            }
        }
    };

    const handleImportCSVFile = (event: React.ChangeEvent<HTMLInputElement>) => {

        const file = event.target.files?.[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);

        Papa.parse(file, {
            // delimiter: ";",
            header: true,
            skipEmptyLines: true,
            complete: (results: any) => {
                const data = results.data as Record<string, string>[];

                if (data.length > 0) {
                    const formattedData: Row[] = data.map((item, index) => ({
                        id: index + 1,
                        ...item,
                    }));

                    const columns = Object.keys(data[0]).map(key => key.toLowerCase());
                    setColumns(columns);
                    setRows(formattedData);
                    // send(formData)
                }
            },
            error: (error: any) => {
                console.error("Ошибка при парсинге CSV:", error);
            }
        });
    };

    // const send = (formData: any) => {
    //     fetch('http://localhost:8080/api/upload', {
    //         method: 'POST',
    //         body: formData,
    //     })
    //         .then(response => response.text())
    //         .then(data => console.log(data));
    // };


    return (
        <div className={styles.interactiveTable} onClick={(e) => handleContextMenuClose(e)}>
            <div className={styles.tableControls}>
                {/* <input
                    type="text"
                    placeholder={t('table.search') + '...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                /> */}
                <button onClick={openFilterModal}>Фильтрация</button>
                <button onClick={openHideColumnsModal}>Скрыть столбцы</button>
                <button onClick={openSortModal}>Сортировка</button>
                <button onClick={openAddRowModal}>Добавить строку</button>
            </div>
            <label htmlFor="fileUpload" className={styles.importButton}>Импорт JSON</label>
            <input
                type="file"
                id="fileUpload"
                accept=".json"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
            />
            <input type="file" onChange={handleImportCSVFile} accept=".csv" />

            <table>
                <thead>
                    <tr>
                        {columns.map((column) => (
                            !hiddenColumns.includes(column) && (
                                <th key={column} onContextMenu={(e) => handleColumnRightClick(e, column)}>
                                    {column}
                                    <span className={styles.sortIcon}>
                                        {sortConfig && sortConfig.key === column.toLowerCase() ? (
                                            sortConfig.direction === 'ascending' ? <FaSortUp /> : <FaSortDown />
                                        ) : (
                                            <span>⇵</span>
                                        )}
                                    </span>
                                </th>
                            )
                        ))}
                        <th>
                            <button onClick={openAddColumnModal} className={styles.addColumnBtn}>
                                <FaPlus />
                            </button>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {filteredRows.map((row, rowIndex) => (
                        <React.Fragment key={row.id}>
                            <tr
                                className={draggedRowIndex === rowIndex ? styles.draggableRowHighlight : styles.draggableRow}
                                draggable="true"
                                onDragStart={() => handleDragStart(rowIndex)}
                                onDragOver={(e) => handleDragOver(rowIndex, e)}
                                onDrop={(e) => handleDrop(rowIndex, e)}
                                onContextMenu={(e) => handleRightClick(e, row)}
                            >
                                {columns.map((column) => {
                                    if (hiddenColumns.includes(column)) return null;
                                    return (
                                        <td
                                            key={column}
                                            onClick={() => handleClick(row.id, column)}
                                        >
                                            {editingCell?.rowId === row.id && editingCell.columnKey === column ? (
                                                <input
                                                    ref={inputRef}
                                                    type="text"
                                                    value={row[column]}
                                                    onChange={(e) => {
                                                        const newValue = e.target.value;
                                                        setRows(rows.map(r => (r.id === row.id ? { ...r, [column]: newValue } : r)));
                                                    }}
                                                    onKeyDown={(e) => handleKeyDown(e, row.id, column)}
                                                    onBlur={() => setEditingCell(null)}
                                                />
                                            ) : (
                                                row[column]
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        </React.Fragment>
                    ))}
                    <tr>
                        <td colSpan={columns.length} style={{ textAlign: 'center' }}>
                            <button onClick={openAddRowModal}>
                                <FaPlus /> Добавить
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* Модальное окно для добавления столбца */}
            {isAddColumnModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h2>Добавить новый столбец</h2>
                        <input
                            type="text"
                            placeholder="Имя нового столбца"
                            value={newColumnName}
                            onChange={(e) => setNewColumnName(e.target.value)}
                        />
                        <select value={newColumnType} onChange={(e) => setNewColumnType(e.target.value)}>
                            <option value="">Выберите тип данных</option>
                            <option value="VARCHAR(255)">VARCHAR(255)</option>
                            <option value="INT">INT</option>
                            <option value="BOOLEAN">BOOLEAN</option>
                        </select>
                        <button onClick={() => addColumn(newColumnName, newColumnType)}>Добавить</button>
                        <button onClick={closeAddColumnModal}>Закрыть</button>
                    </div>
                </div>
            )}

            {/* Модальное окно для скрытия столбцов */}
            {isHideColumnsModalOpen && (
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
            )}

            {/* Модальное окно для фильтрации */}
            {isFilterModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h2>Фильтрация</h2>
                        {columns.map(column => (
                            <div key={column}>
                                <label>{column}</label>
                                <select onChange={(e) => handleFilterChange(column.toLowerCase(), e.target.value)}>
                                    <option value="">Все</option>
                                    {getUniqueValues(column.toLowerCase()).map(value => (
                                        <option key={value} value={value}>{value}</option>
                                    ))}
                                </select>
                            </div>
                        ))}
                        <button onClick={closeFilterModal}>Закрыть</button>
                        <button onClick={resetFilters}>Сбросить фильтр</button>
                    </div>
                </div>
            )}

            {/* Модальное окно сортировки */}
            {isSortModalOpen && (
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
            )}

            {/* Модальное окно для добавления строки */}
            {isAddRowModalOpen && (
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
            )}

            {/* Контекстное меню ячейки */}
            {contextMenu.visible && (
                <div
                    className={styles.contextMenu}
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                    onMouseLeave={(e) => handleContextMenuClose(e)}
                >
                    <button onClick={(e) => handleDeleteRow(e)}>{t(`table.deleteLine`)}</button>
                </div>
            )}

            {/* Контекстное меню для названия столбцов */}
            {columnContextMenu.visible && (
                <div
                    className={styles.contextMenu}
                    style={{ top: columnContextMenu.y, left: columnContextMenu.x }}
                    onMouseLeave={(e) => handleContextMenuClose(e)}
                >
                    <button onClick={(e) => handleDeleteColumn(e)}>{t(`table.deleteColumn`)}</button>
                </div>
            )}
        </div>
    );
}

export default InteractiveTable;

