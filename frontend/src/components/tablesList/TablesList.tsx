import React, { useState, ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";

type Table = {
    id: string;
    name: string;
};

const TablesList: React.FC = () => {
    const [tables, setTables] = useState<Table[]>([]);
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    console.log('ds', sessionStorage.getItem('userID'))

    const parseJSONFile = (content: string, fileName: string): void => {
        try {
            const data = JSON.parse(content);
            const newTable: Table = {
                id: `${Date.now()}`,
                name: fileName,
            };
            setTables(prevTables => [...prevTables, newTable]);
        } catch (error) {
            console.error("Ошибка чтения JSON:", error);
        }
    };

    const handleImportCSVFile = (event: React.ChangeEvent<HTMLInputElement>) => {

        const file = event.target.files?.[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        send(formData);
    };

    const send = (formData: any) => {
        fetch('http://localhost:8080/api/upload', {
            method: 'POST',
            body: formData,
        })
            .then(response => response.text())
            .then(data => console.log(data));
    };

    const handleTableClick = (id: string): void => {
        navigate(`/table/${id}`);
    };

    return (
        <div>
            <h3>Список таблиц</h3>
            <div>
                {/* <label>
                    Загрузить JSON файл
                    <input
                        type="file"
                        accept=".json"
                        onChange={(e) => handleFileUpload(e, 'json')}
                    />
                </label> */}
                <label>
                    Загрузить CSV файл
                    <input
                        type="file"
                        accept=".csv"
                        onChange={(e) => handleImportCSVFile(e)}
                    />
                </label>
            </div>

            <ul>
                {tables.map((table) => (
                    <li key={table.id} onClick={() => handleTableClick(table.id)}>
                        {table.name}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TablesList;
