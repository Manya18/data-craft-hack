import React, { useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Chart as ChartJS, registerables } from 'chart.js';
import { Bar, Doughnut, Pie } from 'react-chartjs-2';
import GridLayout from 'react-grid-layout';
import Modal from '@mui/material/Modal';
import styles from './dashboard.module.css';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

ChartJS.register(...registerables);

interface Chart {
    id: string;
    type: 'bar' | 'pie' | 'doughnut';
    data: {
        labels: string[];
        datasets: {
            label: string;
            data: number[];
            backgroundColor: string[];
        }[];
    };
}

const Dashboard: React.FC = () => {
    const [charts, setCharts] = useState<Chart[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalContext, setIsModalContext] = useState(false);

    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; chartId: string } | null>(null);
    const [contextMenuDaschboard, setContextMenuDaschboard] = useState<{ x: number; y: number; chartId: string } | null>(null);
    const [clipboard, setClipboard] = useState<Chart | null>(null);
    const [pasteMenu, setPasteMenu] = useState<{ x: number; y: number } | null>(null);
    const chartRefs = useRef<{ [key: string]: HTMLCanvasElement | null }>({});
    const [tableName, setTableName] = useState('');
    const [columnName, setColumnName] = useState('');
    const [countElements, setCountElements] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentChartId, setCurrentChartId] = useState(null);

    const sampleData = {
        labels: ['January', 'February', 'March', 'April'],
        datasets: [
            {
                label: 'test',
                data: [30, 50, 40, 60],
                backgroundColor: ['#4caf50', '#2196f3', '#ff9800', '#f44336'],
            },
        ],
    };

    const addChart = (type: 'bar' | 'pie' | 'doughnut') => {
        const newChart: Chart = {
            id: uuidv4(),
            type,
            data: sampleData,
        };
        setCharts((prevCharts) => [...prevCharts, newChart]);
        setIsModalOpen(false);
    };

    const renderChart = (chart: Chart) => {
        const options = {
            maintainAspectRatio: false,
            responsive: true,
        };
        switch (chart.type) {
            case 'bar':
                return <Bar ref={(ref) => (chartRefs.current[chart.id] = ref?.canvas ?? null)} data={chart.data} options={options} />;
            case 'pie':
                return <Pie ref={(ref) => (chartRefs.current[chart.id] = ref?.canvas ?? null)} data={chart.data} options={options} />;
            case 'doughnut':
                return <Doughnut ref={(ref) => (chartRefs.current[chart.id] = ref?.canvas ?? null)} data={chart.data} options={options} />;
            default:
                return null;
        }
    };

    const handleChartContextMenu = (e: React.MouseEvent, chartId: string) => {
        e.preventDefault();
        setContextMenu(null);
        setPasteMenu(null);
        setContextMenuDaschboard({ x: e.clientX, y: e.clientY, chartId });
    };

    const handleCopyClick = (e: React.MouseEvent, chartId: string) => {
        e.stopPropagation();
        const canvas = chartRefs.current[chartId] as HTMLCanvasElement;
        const chartToCopy = charts.find(chart => chart.id === chartId);

        if (canvas && chartToCopy) {
            const imageUrl = canvas.toDataURL('image/png');
            setClipboard({
                id: uuidv4(),
                type: chartToCopy.type,
                data: {
                    labels: chartToCopy.data.labels,
                    datasets: chartToCopy.data.datasets.map(dataset => ({
                        label: dataset.label,
                        data: dataset.data,
                        backgroundColor: dataset.backgroundColor,
                    })),
                },
            });
            toast.success('Диаграмма скопирована в буфер обмена');
        }
        setIsModalContext(false);
    };


    const handleEditClick = (chartId: any) => {
        const chartToEdit = charts.find((chart) => chart.id === chartId);
        if (chartToEdit) {
            setTableName('Ваши_таблицы'); 
            setColumnName(chartToEdit.data.labels[0]); 
            setCountElements(false); 
            setCurrentChartId(chartId);
            setIsEditModalOpen(true);
        }
    };

    const handlePasteMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        setPasteMenu({ x: e.clientX, y: e.clientY });
        setContextMenu(null);
    };

    const handlePaste = () => {
        if (clipboard) {
            setCharts((prevCharts) => [...prevCharts, clipboard]);
            toast.success('Диаграмма вставлена из буфера обмена');
        } else {
            toast.warn('Нечего вставлять');
        }
        setPasteMenu(null);
    };

    const handleSaveChanges = () => {
        setCharts((prevCharts) =>
            prevCharts.map((chart) =>
                chart.id === currentChartId
                    ? {
                        ...chart,
                        data: {
                            ...chart.data,
                            labels: [columnName], // Здесь добавьте логику для обновления данных на основе выбранного столбца
                            datasets: [{
                                ...chart.data.datasets[0],
                                data: countElements ? [/* Логика для подсчета элементов */] : chart.data.datasets[0].data,
                            }],
                        },
                    }
                    : chart
            )
        );
        toast.success('Изменения сохранены');
        setIsEditModalOpen(false);
    };

    return (
        <div
            className={styles.appContainer}
            onClick={() => {
                setContextMenu(null);
                setPasteMenu(null);
            }}
            onContextMenu={(e) => {
                e.preventDefault();
                setPasteMenu({ x: e.clientX, y: e.clientY });
            }}
        >
            <GridLayout className="layout" cols={12} rowHeight={30} width={1200}>
                {charts.map((chart, index) => (
                    <div
                        key={chart.id}
                        className={styles.chartCard}
                        data-grid={{ x: 0, y: index * 2, w: 6, h: 6 }}
                        onContextMenu={(e) => handleChartContextMenu(e, chart.id)}
                    >
                        <div className={styles.dragHandle}>
                            <DragIndicatorIcon />
                        </div>
                        {renderChart(chart)}
                        <div className={styles.copyIcon} onMouseDown={(e) => { setIsModalContext(true); handleChartContextMenu(e, chart.id) }}>
                            <MoreVertIcon />
                        </div>
                    </div>
                ))}
            </GridLayout>

            <button
                className={styles.addWidgetButton}
                onClick={() => setIsModalOpen(true)}
            >
                Добавить виджет
            </button>

            {contextMenu && (
                <div
                    className={styles.contextMenu}
                    style={{
                        position: 'absolute',
                        top: contextMenu.y,
                        left: contextMenu.x,
                        backgroundColor: 'white',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                    }}
                    onMouseLeave={() => setContextMenu(null)}
                >
                </div>
            )}

            {pasteMenu && (
                <div
                    className={styles.contextMenu}
                    style={{
                        position: 'absolute',
                        top: pasteMenu.y,
                        left: pasteMenu.x,
                        backgroundColor: 'white',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                    }}
                    onMouseLeave={() => setPasteMenu(null)}
                >
                    <button onClick={handlePaste}>Вставить</button>
                </div>
            )}

            {contextMenuDaschboard && (
                <Modal
                    open={isModalContext}
                    BackdropProps={{
                        style: { backgroundColor: 'transparent' },
                    }}
                    onClose={() => setIsModalContext(false)}
                >
                    <div
                        className={styles.modalContentDashboard}
                        style={{
                            position: 'absolute',
                            top: contextMenuDaschboard.y,
                            left: contextMenuDaschboard.x,
                        }}
                    >
                        <div className={styles.widgetMenu}>
                            <button
                                className={styles.menuButton}
                                onClick={(e) => handleCopyClick(e, contextMenuDaschboard.chartId)}
                            >
                                Копировать
                            </button>
                            <button
                                className={styles.menuButton}
                                onClick={() => handleEditClick(contextMenuDaschboard.chartId)}
                            >
                                Изменить
                            </button>
                        </div>
                    </div>
                </Modal>
            )}


            <Modal open={isModalOpen} BackdropProps={{
                style: { backgroundColor: 'transparent' },
            }} onClose={() => setIsModalOpen(false)}>
                <div className={styles.modalContent}>
                    <div className={styles.widgetMenu}>
                        <button
                            className={styles.menuButton}
                            onClick={() => addChart('bar')}
                        >
                            Столбчатая диаграмма
                        </button>
                        <button
                            className={styles.menuButton}
                            onClick={() => addChart('pie')}
                        >
                            Круговая диаграмма
                        </button>
                        <button
                            className={styles.menuButton}
                            onClick={() => addChart('doughnut')}
                        >
                            Гистограмма
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal open={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
                <div className={styles.modalContentEdit}>
                    <h2>Изменить график</h2>
                    <label>Имя таблицы:</label>
                    <select value={tableName} onChange={(e) => setTableName(e.target.value)}>
                        <option value="">Выберите таблицу</option>
                        <option value="table1">Таблица 1</option>
                        <option value="table2">Таблица 2</option>
                    </select>

                    <label>Имя столбца:</label>
                    <input
                        type="text"
                        value={columnName}
                        onChange={(e) => setColumnName(e.target.value)}
                        placeholder="Введите имя столбца"
                    />

                    <label>
                        <input
                            type="checkbox"
                            checked={countElements}
                            onChange={(e) => setCountElements(e.target.checked)}
                        />
                        Подсчитать элементы
                    </label>

                    <button onClick={handleSaveChanges}>Сохранить изменения</button>
                </div>
            </Modal>

            <ToastContainer position="top-right" autoClose={5000} hideProgressBar closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
        </div>
    );
};

export default Dashboard;
