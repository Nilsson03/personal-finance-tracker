<template> 
    <div>
        <v-row class="diagrams diagram-wrapper">
            <v-col cols="12" lg="6">
                <v-card class="chart-card" elevation="2">
                    <div v-if="hasChartData">
                        <canvas id="chartCanvas" ref="chartCanvas"></canvas>
                    </div>
                </v-card>
            </v-col>
        </v-row>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, computed, onBeforeUnmount, nextTick } from 'vue'
import { useTransactionStore } from '@/store/transactionStore'
import Chart from 'chart.js/auto'

/* Реактивные ссылки на график */
const chartCanvas = ref<HTMLCanvasElement | null>(null)
const chartInstance = ref<Chart | null>(null)

const transactionStore = useTransactionStore()
const transactions = computed(() => transactionStore.getTransactions)

/* Получение данных для построение круговой диаграммы */
const chartData = computed(() => {
    const totals = new Map<string, number>()
    transactions.value.forEach(({ category, amount }) => {
        totals.set(category.name, (totals.get(category.name) ?? 0) + amount)
    })

    return {
        labels: Array.from(totals.keys()),
        datasets: [
            {
                data: Array.from(totals.values()),
                backgroundColor: ['#4caf50', '#ff9800', '#03a9f4', '#9c27b0'],
            },
        ],
    }
})

const hasChartData = computed(() => chartData.value.datasets[0]?.data.length > 0)

function renderChart() {
    if (!chartCanvas.value) {
        console.warn('Diagrams', 'Canvas element not found')
        return
    }

    if (chartInstance.value) {
        chartInstance.value.destroy()
    }

    chartInstance.value = new Chart(chartCanvas.value, {
        type: 'doughnut',
        data: chartData.value,
        options: {
            plugins: {
                legend: {
                     position: 'bottom'
                },
                title: {
                    display: true,
                    text: 'Расходы за всё время',
                },
            },
        },
    })
}

onMounted(() => {
    if (hasChartData.value) {
        renderChart()
    }
})

watch(chartData, async () => {
    if (!hasChartData.value) {
        chartInstance.value?.destroy()
        return
    }

    await nextTick()
    renderChart()
}, { immediate: true })

onBeforeUnmount(() => {
    chartInstance.value?.destroy()
})
</script>

<style scoped src="./DiagramStyle.css"></style>
<style scoped src="./DiagramStyle.css"></style> 