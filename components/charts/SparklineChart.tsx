'use client'

import { useEffect, useRef } from 'react'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const spData = [
  5380, 5392, 5405, 5388, 5401, 5378, 5395, 5412, 5428, 5419,
  5435, 5442, 5430, 5448, 5456, 5441, 5460, 5472, 5465, 5480,
  5478, 5490, 5487, 5495, 5488, 5502, 5498, 5487, 5492, 5487,
]

export default function SparklineChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<Chart | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Destroy previous instance to avoid "Canvas is already in use" error
    if (chartRef.current) {
      chartRef.current.destroy()
      chartRef.current = null
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: spData.map((_, i) => 'D' + (i + 1)),
        datasets: [
          {
            data: spData,
            borderColor: '#C47A2A',
            borderWidth: 2,
            pointRadius: 0,
            tension: 0.4,
            fill: true,
            backgroundColor: (context) => {
              const chart = context.chart
              const { ctx: c, chartArea } = chart
              if (!chartArea) return 'rgba(196,122,42,0)'
              const gradient = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
              gradient.addColorStop(0, 'rgba(196,122,42,0.25)')
              gradient.addColorStop(1, 'rgba(196,122,42,0)')
              return gradient
            },
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { display: false },
          y: { display: false },
        },
      },
    })

    return () => {
      chartRef.current?.destroy()
      chartRef.current = null
    }
  }, [])

  return (
    <div className="dp-chart">
      <canvas ref={canvasRef} style={{ width: '100%', height: '120px' }} />
    </div>
  )
}
