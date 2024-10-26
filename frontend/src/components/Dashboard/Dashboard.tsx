import React, { useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { Chart as ChartJS, registerables } from 'chart.js';
import { Bar, Doughnut, Pie } from 'react-chartjs-2';
import GridLayout from 'react-grid-layout';
import Modal from '@mui/material/Modal';
import styles from './dashboard.module.css';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

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
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; type: 'copy' | 'paste' | null; chartId?: string } | null>(null);
    const [clipboard, setClipboard] = useState<Chart | null>(null);

    const chartRefs = useRef<{ [key: string]: HTMLCanvasElement | null }>({});
    const [selectedChartId, setSelectedChartId] = useState<string | null>(null);
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

    const handleChartContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY, type: 'paste' });
    };

    const handleCopyClick = (e: React.MouseEvent, chartId: string) => {
        console.log('Copy button clicked', chartId);

        e.stopPropagation();
        const canvas = chartRefs.current[chartId] as HTMLCanvasElement;
        if (canvas) {
            const imageUrl = canvas.toDataURL('image/png');
            setClipboard({
                id: uuidv4(),
                type: 'bar',
                data: {
                    labels: ['Pasted Chart'],
                    datasets: [{
                        label: 'Pasted',
                        data: [1],
                        backgroundColor: ['#4caf50'],
                    }],
                },
            });
            alert('Chart copied to clipboard!');
        }
        setContextMenu(null);
    };

    const handlePaste = () => {
        if (clipboard) {
            setCharts((prevCharts) => [...prevCharts, clipboard]);
            alert('Chart pasted from clipboard!');
        } else {
            alert('Nothing to paste!');
        }
        setContextMenu(null);
    };

    return (
        <div
            className={styles.appContainer}
            onClick={() => setContextMenu(null)}
        >
            <GridLayout className="layout" cols={12} rowHeight={30} width={1200}>
                {charts.map((chart, index) => (
                    <div
                        key={chart.id}
                        className={styles.chartCard}
                        data-grid={{ x: 0, y: index * 2, w: 6, h: 6 }}
                        onContextMenu={handleChartContextMenu}
                    >
                        <div className={styles.dragHandle}>
                            <DragIndicatorIcon />
                        </div>
                        {renderChart(chart)}
                        <div className={styles.copyIcon} onClick={(e) => handleCopyClick(e, chart.id)}>
                            <ContentCopyIcon />
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
                    <button onClick={handlePaste}>Вставить</button>
                </div>
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
                            Столбачатая диаграмма
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
        </div>
    );
};

export default Dashboard;
