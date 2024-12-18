# data-craft-hack

## Описание

Проект позволяет строить диаграммы разных видов по данным из файлов формата .csv и .json.

Этот проект состоит из серверной части и клиентского приложения. Следуйте инструкциям ниже, чтобы настроить и запустить обе части приложения.

## Установка

### 1. Клонирование репозитория

```bash
git clone https://github.com/Manya18/data-craft-hack
cd your-repo-name
2. Установка зависимостей
```

### Серверная часть (Backend)

#### Инструкции по настройке

1. **Перейдите в папку сервера**
   ```bash
   cd backend
   ```
2. **Установите дополнительные зависимости**
   ```bash
   npm install
   ```
3. **Запустите сервер**
   ```bash
   npm run dev
   ```
4. **В базу данных сделайте backup из файлa backend\datacraft.backup**

## Клиентская часть (Frontend)

### Инструкции по настройке

1. **Перейдите в папку клиентской части**
   ```bash
   cd frontend
   ```
2. **Установите дополнительные зависимости**
   ```bash
   npm install
   ```
3. **Запустите клиентскую часть**
   ```bash
   npm start
   ```
## Использование
1. Откройте приложение в браузере
2. Пройдите авторизацию или регистрацию
3. Загрузите таблицу из файла формата .csv и .json. Данные должны иметь следующий вид. 
Для .csv:
 разделитель -- ;
 первая строка должна содержать названия столбцов, остальные строки - данные
Для .json:
в файле должен содержаться массив объектов, где ключ - название столбца, значение - данные

Примеры файлов лежат в папке examples в корневой папке проекта.

4. Для просмотра и редактирования таблицы перейдите в таблицу, нажав на ее название
5. При необходимости вы можете добавить столбцы с формулой и строки, поменять значение ячейки, отфильтровать и отсортировать данные.
6. Для отображения данных в виде графиков перейдите на вкладку Анализ и добавьте необходимые виджеты. Вы можете изменять их размер, перетаскивать, экспортировать в pptx, pdf, docx, а также загружать CSS-файл для изменения стилей. Скачать шаблон CSS-файла вы можете на той же вкладке.
