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
import { ChartOptions } from 'chart.js';

import './DashboardChartStyles.css';
import FiltersModal from './FiltersModal';

ChartJS.register(...registerables);

interface ChartData {
    id: string;
    type: 'bar' | 'pie' | 'histogram' | 'doughnut';
    data: {
        labels: string[];
        datasets: {
            label: string;
            data: number[];
            backgroundColor: string[];
        }[];
    };
    name: string;
    xAxisTitle: string;
    yAxisTitle: string;
    title: string;
}
type Table = {
    user_id: string;
    table_name: string;
};

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
    const [customStyle, setCustomStyle] = useState<HTMLStyleElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [tables, setTables] = useState<Table[]>([]);
    const [trigger, setTrigger] = useState('');
    const [uniqueValues, setUniqueValues] = useState([]);
    const [counts, setCounts] = useState([]);



    const [columns, setColumns] = useState<string[]>([]);
    const [isFilterModal, setIsFilterModal] = useState(false);
    const [filters, setFilters] = useState({ column: '', value: '' });
    const [loading, setLoading] = useState(false);

    const [rows, setRows] = useState<Record<string, any>[]>([]);

    const user_id = sessionStorage.getItem("userID");
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const filters_str = JSON.stringify(filters);
                console.log(filters_str)
                if (tableName) {
                    console.log(filters)
                    const response = await fetch(
                        `http://localhost:8080/api/table?table=${tableName}${filters.column ? ('&filters=[' + JSON.stringify(filters) + ']') : ''}`
                    );
                    const data = await response.json();
                    setRows(data.data);
                    setColumns(Object.keys(data.data[0]));
                    console.log(columns)
                    setLoading(false);
                }
            } catch (error) {
                console.error("Ошибка при получении данных:", error);
                setLoading(false);
            }
        };
        fetchData();
    }, [tableName, filters]);


    useEffect(() => {
        const fetchUniqueCount = async () => {
            const requestData = {
                table_name: tableName,
                count: columnName,
                condition_column: filters.column,
                condition_value: filters.value
            };

            try {
                const response = await fetch("http://localhost:8080/api/uniqcount", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(requestData),
                });

                if (!response.ok) {
                    throw new Error("Ошибка при выполнении запроса");
                }

                const data = await response.json();
                setUniqueValues(data.uniqueValues);
                setCounts(data.counts);
                console.log("Уникальные значения:", data.uniqueValues);
                console.log("Количество уникальных значений:", data.counts);
            } catch (error) {
                console.error("Ошибка при выполнении запроса:", error);
            }
        };

        fetchUniqueCount();

    }, [tableName, columnName, filters]);


    useEffect(() => {
        const fetchTables = async () => {
            if (user_id) {
                try {
                    const response = await fetch(
                        `http://localhost:8080/api/tables?user_id=${user_id}`
                    );
                    if (!response.ok) throw new Error("Trouble");
                    const tablesData = await response.json();
                    setTables(tablesData);
                } catch (error) {
                    console.error(error);
                }
            }
        };
        fetchTables();
    }, [user_id, trigger]);

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
        labels: ['Test1', 'Test2'],
        datasets: [
            {
                label: '',
                data: [1, 2, 3, 4],
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
            xAxisTitle: columnName || "Ось X",
            yAxisTitle: 'Количество',
            title: `${filters.column} ${filters.value}`,
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


    const getChartOptions = (chartType: any, chart: ChartData) => {
        const rootStyles = getComputedStyle(document.documentElement);

        const legendDisplay = rootStyles.getPropertyValue('--legend-display').trim() === 'true';
        const legendPosition = rootStyles.getPropertyValue('--legend-position').trim();
        const legendColor = rootStyles.getPropertyValue('--legend-color').trim();
        const legendFontSize = parseInt(rootStyles.getPropertyValue('--legend-font-size'), 10);

        const axisColor = rootStyles.getPropertyValue('--axis-color').trim();
        const axisTickColor = rootStyles.getPropertyValue('--axis-tick-color').trim();
        const axisFontSize = parseInt(rootStyles.getPropertyValue('--axis-font-size'), 10);
        const axisTitleFontSize = parseInt(rootStyles.getPropertyValue('--axis-title-font-size'), 10);

        if (chartType === 'bar') {
            return {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        // text: chart.title,
                        font: {
                            size: 20
                        },
                        padding: {
                            top: 10,
                            bottom: 10
                        }
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: chart.xAxisTitle,
                            color: axisColor,
                            font: {
                                size: axisTitleFontSize,
                            }
                        },
                        ticks: {
                            color: axisTickColor,
                            font: {
                                size: axisFontSize,
                            }
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: chart.yAxisTitle,
                            color: axisColor,
                            font: {
                                size: axisTitleFontSize,
                            }
                        },
                        ticks: {
                            font: {
                                size: axisFontSize,
                            }
                        },
                        beginAtZero: true
                    }
                }
            } as ChartOptions<'bar'>;
        } else if (chartType === 'pie' || chartType === 'doughnut') {
            return {
                responsive: true,
                plugins: {
                    legend: {
                        display: legendDisplay,
                        position: legendPosition as 'top' | 'bottom' | 'left' | 'right',
                        labels: {
                            color: legendColor,
                            font: {
                                size: legendFontSize,
                            }
                        }
                    }
                }
            } as ChartOptions<'pie'>;
        }

        return {};
    };

    const getHistogramOptions = (): ChartOptions<'bar'> => {
        return {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: 'var(--text-color)',
                        font: {
                            size: 14,
                        },
                    },
                },
                tooltip: {
                    callbacks: {
                        label: (tooltipItem) => {
                            return `Частота: ${tooltipItem.raw}`;
                        },
                    },
                },
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Границы',
                        color: 'var(--axis-color)',
                        font: {
                            size: 16,
                        },
                    },
                    ticks: {
                        color: 'var(--axis-tick-color)',
                    },
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Частота',
                        color: 'var(--axis-color)',
                        font: {
                            size: 16,
                        },
                    },
                    ticks: {
                        color: 'var(--axis-tick-color)',
                    },
                },
            },
        };
    };


    const renderChart = (chart: ChartData) => {
        const rootStyles = getComputedStyle(document.documentElement);
        const chartWidth = '100%';
        const chartHeight = '100%';

        let options: ChartOptions<'bar'> | ChartOptions<'pie'> | ChartOptions<'doughnut'> = {};

        if (chart.type === 'bar') {
            options = getChartOptions('bar', chart);
        } else if (chart.type === 'pie') {
            options = getChartOptions('pie', chart);
        } else if (chart.type === 'doughnut') {
            options = getChartOptions('doughnut', chart);
        } else if (chart.type === 'histogram') {
            options = getHistogramOptions();
        }

        const barColors = [];
        const barBorderColors = [];
        for (let i = 1; i <= 10; i++) {
            barColors.push(rootStyles.getPropertyValue(`--bar-color-${i}`).trim());
            barBorderColors.push(rootStyles.getPropertyValue(`--bar-border-color-${i}`).trim());
        }
        const barBorderWidth = parseInt(rootStyles.getPropertyValue('--bar-border-width'), 10);

        const chartData = {
            labels: chart.data.labels,
            datasets: [
                {
                    label: chart.data.datasets[0].label,
                    data: chart.type === 'histogram' ? createBins(chart.data.datasets[0].data, 5) : chart.data.datasets[0].data,
                    backgroundColor: barColors,
                    borderColor: barBorderColors,
                    borderWidth: barBorderWidth,
                },
            ],
        };

        return (
            <div style={{ width: chartWidth, height: chartHeight, display: "flex", justifyContent: "center", paddingBottom: "40px" }}>
                {(() => {
                    switch (chart.type) {
                        case 'bar':
                            return (
                                <Bar
                                    ref={(ref) => (chartRefs.current[chart.id] = ref?.canvas ?? null)}
                                    data={chartData}
                                    options={options as ChartOptions<'bar'>} />
                            );
                        case 'pie':
                            return (
                                <Pie
                                    ref={(ref) => (chartRefs.current[chart.id] = ref?.canvas ?? null)}
                                    data={chartData}
                                    options={options as ChartOptions<'pie'>} />
                            );
                        case 'doughnut':
                            return (
                                <Doughnut
                                    ref={(ref) => (chartRefs.current[chart.id] = ref?.canvas ?? null)}
                                    data={chartData}
                                    options={options as ChartOptions<'doughnut'>} />
                            );
                        case 'histogram':
                            const binSize = 5;
                            const bins = createBins(chart.data.datasets[0].data, binSize);
                            const histogramData = {
                                labels: bins.map((_, i) => `${i * binSize}-${(i + 1) * binSize}`),
                                datasets: [
                                    {
                                        label: chart.data.datasets[0].label || 'Частота',
                                        data: bins,
                                        backgroundColor: barColors,
                                        borderColor: barBorderColors,
                                        borderWidth: barBorderWidth,
                                    },
                                ],
                            };
                            return (
                                <Bar
                                    ref={(ref) => (chartRefs.current[chart.id] = ref?.canvas ?? null)}
                                    data={histogramData}
                                    options={options as ChartOptions<'bar'>} />
                            );
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
                xAxisTitle: chartToCopy.xAxisTitle,
                yAxisTitle: chartToCopy.yAxisTitle,
                title: chartToCopy.title
            });
            toast.success('Диаграмма скопирована в буфер обмена');
        }
        setIsModalContext(false);
    };


    const handleEditClick = (chartId: any) => {
        const chartToEdit = charts.find((chart) => chart.id === chartId);
        if (chartToEdit) {
            setTableName('');
            setColumnName('');
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
                        xAxisTitle: columnName,
                        yAxisTitle: 'Количество',
                        title: `${filters.column} ${filters.value}`,
                        data: {
                            ...chart.data,
                            labels: uniqueValues,
                            datasets: [{
                                ...chart.data.datasets[0],
                                data: counts
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

    const handleDownload = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/download/styles', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/pdf',
                },
            });
            if (!response.ok) {
                throw new Error('Ошибка при загрузке файла');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = 'DashboardChartStyles.css';
            link.click();

            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Ошибка при скачивании файла:', error);
        }
    };

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    const loadCSSFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            if (customStyle) {
                document.head.removeChild(customStyle);
            }

            const newStyle = document.createElement('style');
            newStyle.innerHTML = e.target?.result as string;
            document.head.appendChild(newStyle);
            setCustomStyle(newStyle);
            console.log("CSS файл успешно загружен и применен.");
            toast.success('CSS файл успешно загружен и применен');
        };

        reader.onerror = () => {
            console.error("Ошибка при чтении CSS файла");
            toast.warn('Ошибка при чтении CSS файла');
        };

        reader.readAsText(file);
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
            <GridLayout className="layout dashboard-container" cols={12} rowHeight={40} width={1200}
            // style={{ overflowY: "hidden" }}
            >
                {charts.map((chart, index) => (
                    <div
                        key={chart.id}
                        id={chart.id}
                        className="chartCard dashboard"
                        data-grid={{ x: 0, y: index * 2, w: 6, h: 7 }}
                        onContextMenu={(e) => handleChartContextMenu(e, chart.id)}
                    >
                        <div className={`${styles.dragHandle} drag-icon`}>
                            <DragIndicatorIcon />
                        </div>
                        <div className="ChartName">{diagramName}</div>
                        <div className="chart-container">
                            <div className="chart">{renderChart(chart)}</div>
                        </div>
                        <div className={`${styles.moreVertIcon} more-vert-icon`} onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsModalContext(true);
                            handleChartContextMenu(e, chart.id);
                        }}>
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
                <button
                    className={styles.addWidgetButton}
                    onClick={() => handleDownload()}
                >
                    Скачать шаблон стилей
                </button>
                <div>

                    <button className={styles.addWidgetButton} onClick={handleButtonClick}>Загрузить CSS файл</button>
                    <input
                        type="file"
                        accept=".css"
                        ref={fileInputRef}
                        onChange={loadCSSFile}
                        style={{ display: 'none' }}
                    />
                </div>
            </div>
            {
                contextMenu && (
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
                )
            }

            {
                pasteMenu && (
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
                )
            }

            {
                contextMenuDaschboard && (
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
                )
            }


            <Modal open={isModalOpen} BackdropProps={{
                style: { backgroundColor: 'transparent' },
            }} onClose={() => setIsModalOpen(false)}>
                <div className={styles.modalContent} >
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
                            Кольцевая диаграмма
                        </button>
                        <button
                            className={styles.menuButton}
                            onClick={() => addChart('histogram')}
                        >
                            Гистограмма
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
                        {tables.map((table: Table) => (
                            <option key={table.user_id} value={table.table_name}>
                                {table.table_name}
                            </option>
                        ))}
                    </select>

                    <label>Имя столбца:</label>
                    <select value={columnName} onChange={(e) => setColumnName(e.target.value)}>
                        <option value="">Выберите столбец</option>
                        {columns.map((column) => (
                            <option key={column} value={column}>
                                {column}
                            </option>
                        ))}
                    </select>
                    <FiltersModal columns={columns} table={tableName} setIsFilterModal={setIsFilterModal} setFilters={setFilters}></FiltersModal>
                    {/* 
                    <label>
                        <input
                            type="checkbox"
                            checked={countElements}
                            onChange={(e) => setCountElements(e.target.checked)}
                        />
                        Подсчитать элементы
                    </label> */}

                    <button className={styles.addWidgetButton} onClick={handleSaveChanges}>Сохранить изменения</button>
                </div>
            </Modal>

            <ToastContainer position="top-right" autoClose={5000} hideProgressBar closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
        </div >
    );
};

export default Dashboard;

