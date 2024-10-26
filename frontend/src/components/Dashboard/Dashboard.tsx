import React, { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Chart, Chart as ChartJS, registerables } from 'chart.js';
import { Bar, Doughnut, Pie } from 'react-chartjs-2';
import GridLayout from 'react-grid-layout';
import Modal from '@mui/material/Modal';
import styles from './dashboard.module.css';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AlignmentType, Document, ImageRun, Packer, Paragraph, TextRun } from "docx";
import saveAs from "file-saver";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import PptxGenJS from "pptxgenjs";
import styled from '@emotion/styled';

ChartJS.register(...registerables);

interface ChartData {
    id: string;
    type: 'bar' | 'pie' | 'histogram' | 'doughnut';
    name: string;
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
    const [charts, setCharts] = useState<ChartData[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalContext, setIsModalContext] = useState(false);
    const [isExportOpen, setIsExportOpen] = useState(false);

    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; chartId: string } | null>(null);
    const [contextMenuDaschboard, setContextMenuDaschboard] = useState<{ x: number; y: number; chartId: string } | null>(null);
    const [clipboard, setClipboard] = useState<ChartData | null>(null);
    const [pasteMenu, setPasteMenu] = useState<{ x: number; y: number } | null>(null);
    const chartRefs = useRef<{ [key: string]: HTMLCanvasElement | null }>({});
    const [tableName, setTableName] = useState('');
    const [diagramName, setDiagramName] = useState('');
    const [columnName, setColumnName] = useState('');
    const [countElements, setCountElements] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentChartId, setCurrentChartId] = useState(null);
    const [isScrolled, setIsScrolled] = useState(false);

    const handleScroll = () => {
        if (window.scrollY > 50) {
            setIsScrolled(true);
        } else {
            setIsScrolled(false);
        }
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

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

    const addChart = (type: 'bar' | 'pie' | 'doughnut' | 'histogram') => {
        const newChart: ChartData = {
            id: uuidv4(),
            type,
            data: sampleData,
            name: diagramName || "Без названия",
        };
        setCharts((prevCharts) => [...prevCharts, newChart]);
        setIsModalOpen(false);
    };

    function createBins(data: any, binSize: number) {
        const max = Math.max(...data);
        const bins = Array(Math.ceil(max / binSize)).fill(0);

        data.forEach((value: number) => {
            const binIndex = Math.floor(value / binSize);
            bins[binIndex] += 1;
        });

        return bins;
    }


    const renderChart = (chart: ChartData) => {
        const options = {
            maintainAspectRatio: false,
            responsive: true,
        };

        const chartWidth = '90%';
        const chartHeight = '90%';
        return (
            <div style={{ width: chartWidth, height: chartHeight }}>
                {(() => {
                    switch (chart.type) {
                        case 'bar':
                            return (
                                <Bar
                                    ref={(ref) => (chartRefs.current[chart.id] = ref?.canvas ?? null)}
                                    data={chart.data}
                                    options={options}
                                />
                            );
                        case 'pie':
                            return (
                                <Pie
                                    ref={(ref) => (chartRefs.current[chart.id] = ref?.canvas ?? null)}
                                    data={chart.data}
                                    options={options}
                                />
                            );
                        case 'doughnut':
                            return (
                                <Doughnut
                                    ref={(ref) => (chartRefs.current[chart.id] = ref?.canvas ?? null)}
                                    data={chart.data}
                                    options={options}
                                />
                            );
                        case 'histogram': {
                            const binSize = 5;
                            const bins = createBins(chart.data.datasets[0].data, binSize);
                            const labels = bins.map((_, i) => `${i * binSize}-${(i + 1) * binSize}`);

                            const histogramData = {
                                labels: labels,
                                datasets: [
                                    {
                                        label: chart.data.datasets[0].label || 'Частота',
                                        data: bins,
                                        backgroundColor: chart.data.datasets[0].backgroundColor || 'rgba(153, 102, 255, 0.2)',
                                        borderColor: 'rgba(153, 102, 255, 1)',
                                        borderWidth: 1,
                                    },
                                ],
                            };

                            return (
                                <Bar
                                    ref={(ref) => (chartRefs.current[chart.id] = ref?.canvas ?? null)}
                                    data={histogramData}
                                    options={options}
                                />
                            );
                        }
                        default:
                            return null;
                    }
                })()}
            </div>
        );
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
                name: diagramName,
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
            setTableName('Таблицы');
            setColumnName(chartToEdit.data.labels[0]);
            setCountElements(false);
            setCurrentChartId(chartId);
            setIsEditModalOpen(true);
        }
        setIsModalContext(false);
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
                        name: diagramName,
                        data: {
                            ...chart.data,
                            labels: [columnName],
                            datasets: [{
                                ...chart.data.datasets[0],
                                data: countElements ? [] : chart.data.datasets[0].data,
                            }],
                        },
                    }
                    : chart
            )
        );
        toast.success('Изменения сохранены');
        setIsEditModalOpen(false);
    };

    const IconHide = async (chartElement: any) => {
        const dragIcon = chartElement.querySelector('.drag-icon');
        const moreVertIcon = chartElement.querySelector('.more-vert-icon');
        if (dragIcon) dragIcon.style.display = 'none';
        if (moreVertIcon) moreVertIcon.style.display = 'none';
    }

    const IconHideAll = async (chartContainer: any) => {
        const dragIcon = chartContainer.querySelectorAll('.drag-icon');
        const moreVertIcon = chartContainer.querySelectorAll('.more-vert-icon');
        dragIcon.forEach((icon: { style: { display: string; }; }) => icon.style.display = 'none');
        moreVertIcon.forEach((icon: { style: { display: string; }; }) => icon.style.display = 'none');
    }

    const IconShow = async (chartElement: any) => {
        const dragIcon = chartElement.querySelector('.drag-icon');
        const moreVertIcon = chartElement.querySelector('.more-vert-icon');
        if (dragIcon) dragIcon.style.display = '';
        if (moreVertIcon) moreVertIcon.style.display = '';
    }

    const IconShowAll = async (chartContainer: any) => {
        const dragIcon = chartContainer.querySelectorAll('.drag-icon');
        const moreVertIcon = chartContainer.querySelectorAll('.more-vert-icon');
        dragIcon.forEach((icon: { style: { display: string; }; }) => icon.style.display = '');
        moreVertIcon.forEach((icon: { style: { display: string; }; }) => icon.style.display = '');
    }

    const exportChartsToPDF = async (chartId: any) => {
        setIsModalContext(false);
        const doc = new jsPDF();
        const chartElement = document.getElementById(chartId);

        if (chartElement) {
            IconHide(chartElement)
            const canvas = await html2canvas(chartElement);
            const imgData = canvas.toDataURL('image/png');
            doc.addImage(imgData, 'PNG', 10, 10, 180, (canvas.height * 180) / canvas.width + 20);
            doc.save(`${diagramName}.pdf`);
            IconShow(chartElement)
        };
    }

    const exportAllChartsToPDF = async () => {
        const doc = new jsPDF();
        const chartContainer = document.querySelector('.dashboard-container');

        if (chartContainer) {
            IconHideAll(chartContainer)
            const element = chartContainer as HTMLElement;
            const canvas = await html2canvas(element);
            const imgData = canvas.toDataURL('image/png');
            doc.addImage(imgData, 'PNG', 10, 10, 180, (canvas.height * 180) / canvas.width - 10);
            doc.save(`${diagramName}.pdf`);
            IconShowAll(chartContainer)
        };
    };


    const exportChartsToDOCX = async (chartId: any) => {
        setIsModalContext(false);
        const chartElement = document.getElementById(chartId);
        if (chartElement) {
            IconHide(chartElement)
            const canvas = await html2canvas(chartElement);
            const imgData = canvas.toDataURL('image/png');

            const image = new ImageRun({
                data: imgData,
                transformation: {
                    width: 500,
                    height: (canvas.height * 500) / canvas.width
                },
                type: 'png',
            });

            const doc = new Document({
                sections: [
                    {
                        properties: {},
                        children: [
                            new Paragraph({
                                children: [
                                    new TextRun(`Диаграмма ${diagramName}`),
                                ],
                            }),
                            new Paragraph({
                                children: [image],
                            }),
                        ],
                    },
                ],
            });
            const buffer = await Packer.toBlob(doc);
            saveAs(buffer, `${diagramName}.docx`);
            IconShow(chartElement)
        }
    }

    const exportAllChartsToDOCX = async () => {
        const chartContainer = document.querySelector('.dashboard-container');
        if (chartContainer) {
            IconHideAll(chartContainer)
            const element = chartContainer as HTMLElement;
            const canvas = await html2canvas(element);
            const imgData = canvas.toDataURL('image/png');
            const image = new ImageRun({
                data: imgData,
                transformation: {
                    width: 794,
                    height: (canvas.height * 595) / canvas.width
                },
                type: 'png',
            });
            const doc = new Document({
                sections: [
                    {
                        properties: {},
                        children: [
                            new Paragraph({
                                children: [
                                    new TextRun(`Диаграмма ${diagramName}`),
                                ],
                            }),
                            new Paragraph({
                                children: [image],
                            }),
                        ],
                    },
                ],
            });
            const buffer = await Packer.toBlob(doc);
            saveAs(buffer, `${diagramName}.docx`);
            IconShowAll(chartContainer)
        }
    }

    const exportChartsToPPTX = async (chartId: any) => {
        setIsModalContext(false);
        const chartElement = document.getElementById(chartId);

        if (chartElement) {
            IconHide(chartElement)
            const canvas = await html2canvas(chartElement);
            const imgData = canvas.toDataURL("image/png");
            const pptx = new PptxGenJS();
            const slide = pptx.addSlide();
            slide.addImage({
                data: imgData,
                x: 0.5,
                y: 0.5,
                w: 7,
                h: (canvas.height * 7) / canvas.width,
            });
            pptx.writeFile({ fileName: `${diagramName}.pptx` });
            IconShow(chartElement)
        }
    };

    const exportAllChatrsToPPTX = async () => {
        const chartContainer = document.querySelector('.dashboard-container');
        const pptx = new PptxGenJS();

        if (chartContainer) {
            IconHideAll(chartContainer)
            const element = chartContainer as HTMLElement;
            const canvas = await html2canvas(element);
            const imgData = canvas.toDataURL("image/png");
            const slide = pptx.addSlide();
            slide.addImage({
                data: imgData,
                x: 0.5,
                y: 0.5,
                w: 9,
                h: (canvas.height * 9) / canvas.width,
            });
            pptx.writeFile({ fileName: `Отчет.pptx` });
            IconShowAll(chartContainer)
        }
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
            <GridLayout className="layout dashboard-container" cols={12} rowHeight={40} width={1200}>
                {charts.map((chart, index) => (
                    <div
                        key={chart.id}
                        id={chart.id}
                        className={`${styles.chartCard} dashboard`}
                        data-grid={{ x: 0, y: index * 2, w: 6, h: 7 }}
                        onContextMenu={(e) => handleChartContextMenu(e, chart.id)}
                    >
                        <div className={`${styles.dragHandle} drag-icon`}>
                            <DragIndicatorIcon />
                        </div>
                        <div className={styles.ChartName}>{chart.name}</div>
                        {renderChart(chart)}
                        <div className={`${styles.moreVertIcon} more-vert-icon`} onMouseDown={(e) => { setIsModalContext(true); handleChartContextMenu(e, chart.id) }}>
                            <MoreVertIcon />
                        </div>
                    </div>
                ))}
            </GridLayout>
            <div className={`${styles.fixedButtonContainer} ${isScrolled ? styles.scrolled : ''}`}>
                <button
                    className={styles.addWidgetButton}
                    onClick={() => setIsModalOpen(true)}
                >
                    Добавить виджет
                </button>

                <button
                    className={styles.addWidgetButton}
                    onClick={() => setIsExportOpen(true)}
                >
                    Экспортировать дашборд
                </button>
            </div>
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
                    <button className={styles.menuButton} onClick={handlePaste}>Вставить</button>
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
                            <button className={styles.menuButton} onClick={() => exportChartsToDOCX(contextMenuDaschboard.chartId)}>Экспортировать в docx</button>
                            <button className={styles.menuButton} onClick={() => exportChartsToPDF(contextMenuDaschboard.chartId)}>Экспортировать в PDF</button>
                            <button className={styles.menuButton} onClick={() => exportChartsToPPTX(contextMenuDaschboard.chartId)}>Экспортировать в pptx</button>
                        </div>
                    </div>
                </Modal>
            )}


            <Modal open={isModalOpen} BackdropProps={{
                style: { backgroundColor: 'transparent' },
            }} onClose={() => setIsModalOpen(false)}>
                <div className={styles.modalContent} >
                    <div className={styles.widgetMenu}>
                        <button
                            className={styles.menuButton}
                            onClick={() => addChart('histogram')}
                        >
                            Гистограмма
                        </button>
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
                            Кольцевая диаграмма
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal open={isExportOpen} BackdropProps={{
                style: { backgroundColor: 'transparent' },
            }} onClose={() => setIsExportOpen(false)}>
                <div className={styles.modalContentExport}>
                    <div className={styles.widgetMenu}>
                        <button
                            className={styles.menuButton}
                            onClick={() => exportAllChartsToPDF()}
                        >
                            в pdf
                        </button>
                        <button
                            className={styles.menuButton}
                            onClick={() => exportAllChatrsToPPTX()}
                        >
                            в pptx
                        </button>
                        <button
                            className={styles.menuButton}
                            onClick={() => exportAllChartsToDOCX()}
                        >
                            в docx
                        </button>
                    </div>
                </div>
            </Modal>


            <Modal open={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
                <div className={styles.modalContentEdit}>
                    <h2>Изменить график</h2>
                    <label>Название диаграммы:</label>
                    <input
                        type="text"
                        value={diagramName}
                        onChange={(e) => setDiagramName(e.target.value)}
                        placeholder="Введите название"
                    />
                    <label>Имя таблицы:</label>
                    <select value={tableName} onChange={(e) => setTableName(e.target.value)}>
                        <option value="">Выберите таблицу</option>
                        <option value="table1">Таблица 1</option>
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

                    <button className={styles.addWidgetButton} onClick={handleSaveChanges}>Сохранить изменения</button>
                </div>
            </Modal>

            <ToastContainer position="top-right" autoClose={5000} hideProgressBar closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
        </div>
    );
};

export default Dashboard;

