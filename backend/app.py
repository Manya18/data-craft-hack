from flask import Flask, request, jsonify
import psycopg2
import pandas as pd
from io import StringIO

app = Flask(__name__)

# Параметры подключения к базе данных
db_config = {
    'dbname': 'datacraft_samars',
    'user': 'postgres',
    'password': 'postgres',
    'host': 'localhost'
}

# Функция для подключения к PostgreSQL
def connect_db():
    conn = psycopg2.connect(**db_config)
    return conn

@app.route('/upload-csv', methods=['POST'])
def upload_csv():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    # Чтение CSV файла
    csv_data = StringIO(file.stream.read().decode("UTF8"), newline=None)
    df = pd.read_csv(csv_data)

    # Создание таблицы в PostgreSQL
    conn = connect_db()
    cursor = conn.cursor()

    # Создание таблицы с первыми строками в качестве названий столбцов
    columns = df.columns.tolist()
    create_table_query = f"CREATE TABLE IF NOT EXISTS my_table ({', '.join([f'{col} TEXT' for col in columns])});"
    cursor.execute(create_table_query)

    # Вставка данных в таблицу
    for index, row in df.iterrows():
        insert_query = f"INSERT INTO my_table ({', '.join(columns)}) VALUES ({', '.join(['%s'] * len(row))});"
        cursor.execute(insert_query, tuple(row))

    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({"message": "CSV файл обработан и данные успешно вставлены!"}), 200

if __name__ == '__main__':
    app.run(debug=True)