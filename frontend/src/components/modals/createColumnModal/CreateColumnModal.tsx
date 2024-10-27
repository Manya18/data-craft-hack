import { useEffect, useState } from "react";
import styles from "./createColumnModal.module.css";
import { toast, ToastContainer } from "react-toastify";

const CreateColumnModal = ({
  columns,
  table,
  setIsAddColumnModal,
}: {
  columns: string[];
  table: string;
  setIsAddColumnModal: (isFilterModal: boolean) => void;
}) => {
  const [columnName, setColumnName] = useState('');
    const [dataType, setDataType] = useState('TEXT');
    const [selectedColumn_1, setSelectedColumn_1] = useState('');
    const [selectedColumn_2, setSelectedColumn_2] = useState('');

    const [operation, setOperation] = useState('+');

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:8080/api/column', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    table,
                    dataType,
                    selectedColumn_1,
                    selectedColumn_2,
                    columnName,
                    operation
                }),
            });

            if (response.ok) {
                toast.success('Столбец успешно добавлен!');
                setColumnName('');
                setDataType('TEXT');
                setSelectedColumn_1('');
                setSelectedColumn_2('');
                setOperation('+');
                // setIsAddColumnModal(false)
            } else {
                toast.warn(('Ошибка при добавлении столбца'));
            }
        } catch (error) {
            console.error('Ошибка:', error);
        }
    };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h2>Фильтрация</h2>
        <div className={styles.modalContent}>
        <div className={styles.wrapper}>
                <label>Название столбца:</label>
                <input
                    type="text"
                    value={columnName}
                    onChange={(e) => setColumnName(e.target.value)}
                    required
                />
            </div>
            <div>
                <label>Тип данных:</label>
                <select value={dataType} onChange={(e) => setDataType(e.target.value)}>
                    <option value="TEXT">Текст</option>
                    <option value="integer">Число</option>
                </select>
            </div>
            <div>
                
                <label>Выберите столбец 1:</label>
                <select value={selectedColumn_1} onChange={(e) => setSelectedColumn_1(e.target.value)}>
                    {columns.map((column) => (
                        <option key={column} value={column}>{column}</option>
                    ))}
                </select>
                <label>Выберите столбец 2:</label>
                <select value={selectedColumn_2} onChange={(e) => setSelectedColumn_2(e.target.value)}>
                    {columns.map((column) => (
                        <option key={column} value={column}>{column}</option>
                    ))}
                </select>
            </div>
            <div>
                <label>Операция:</label>
                <select value={operation} onChange={(e) => setOperation(e.target.value)}>
                    <option value="+">Сложить</option>
                    {dataType !== "TEXT" && <option value="-">Вычесть</option>}
                    {dataType !== "TEXT" && <option value="*">Умножить</option>}
                    {dataType !== "TEXT" && <option value="/">Разделить</option>}
                </select>
            </div>
        </div>
        <button
        className="outlined-button"
          onClick={() => {
            setIsAddColumnModal(false);
          }}
        >
          Закрыть
        </button>
        <button className="primary-button" onClick={handleSubmit}>Создать</button>
      </div>
      <ToastContainer/>
    </div>
  );
};

export default CreateColumnModal