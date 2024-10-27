import { useState } from "react";
import { toast } from "react-toastify";

interface columnsType {
    column_name: string,
    data_type: string
}

const TableHeadCell = ({col, tableName} : {col: columnsType, tableName: string}) => {
    const [dataType, setDataType] = useState(col.data_type);

    const handleUpdateColumnType = async (col: columnsType, newColumnType: string) => {
        try {
          const responce = await fetch("http://localhost:8080/api/type", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ table_name: tableName, column_name: col.column_name, new_column_type: newColumnType }),
          });
          if (!responce.ok) {
            toast.error('Невозможно конвертировать в данный тип');
          }else {
            setDataType(newColumnType);
          }
        } catch (e) {
          console.error(e);
        }
      };

    return (
        <td key={col.column_name}>
                  <div> {col.column_name}</div>
                  <select value={dataType} onChange={(e) => {handleUpdateColumnType(col, e.target.value);}}>
                    {/* <option value="">{dataType}</option> */}
                    <option value="numeric">Числовой</option>
                    <option value="text">Текст</option>
                    <option value="date">Дата</option>
                  </select>
                  {/* <button onClick={() => handleUpdateColumnType(col.column_name)}>Изменить тип</button> */}
                </td>
    )
}

export default TableHeadCell;