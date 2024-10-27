import { useEffect, useState } from "react";
import styles from "./filtersModal.module.css"

const FiltersModal = ({columns, table, setIsFilterModal}: {columns: string[],  table: string, setIsFilterModal: (isFilterModal: boolean) => void}) => {
    const [loading, setLoading] = useState(false);
    const [selectedColumn, setSelectedColumn] = useState('');
    const [selectedColumnValue, setSelectedColumnValue] = useState('');
    const [columnValues, setColumnValues] = useState<string[]>([])

    useEffect(() => {
        const fetchData = async () => {
          try {
            setLoading(true);
            const response = await fetch(
              `http://localhost:8080/api/columnDistinct?column=${selectedColumn}&table=${table}`
            );
            const data = await response.json();
            console.log(data)
            setColumnValues(data)
            setLoading(false);
          } catch (error) {
            console.error("Ошибка при получении данных:", error);
            setLoading(false);
          }
        };
        fetchData();
      }, [selectedColumn]);
    

    return (
        <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h2>Фильтрация</h2>
                                <select onChange={(e) => setSelectedColumn(e.target.value)}>
                                    <option value="">Все</option>
                                    {columns.map(value => (
                                        <option key={value} value={value}>{value}</option>
                                    ))}
                                </select>
                                <select onChange={(e) => setSelectedColumn(e.target.value)}>
                                    <option value="">Все</option>
                                    {columnValues.map(value => (
                                        <option key={value} value={value}>{value}</option>
                                    ))}
                                </select>
                        <button onClick={() => {setIsFilterModal(false)}}>Закрыть</button>
                        {/* <button onClick={resetFilters}>Сбросить фильтр</button> */}
                    </div>
                </div>
    )
} 

export default FiltersModal;