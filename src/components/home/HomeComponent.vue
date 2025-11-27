<template>
    <div class="home-screen">
        <v-breadcrumbs class="nav" color="primary"
            :items="['Главная', 'История трат']" />

        <section class="hero">
            <div class="hero__content">
                <p class="hero__eyebrow">Персональный трекер</p>
                <h1>Контролируйте бюджет уверенно</h1>
                <p class="hero__subtitle">
                    Добавляйте расходы, пересматривайте баланс и наблюдайте за ключевыми категориями в одном месте.
                </p>
                <div class="hero__actions">
                    <v-btn color="primary" rounded="xl" @click="state.openWriteDialog = true">
                        Добавить запись
                    </v-btn>
                    <v-btn variant="tonal" color="primary" rounded="xl" @click="openBalanceDialog">
                        Обновить баланс
                    </v-btn>
                </div>
            </div>
            <div class="hero__badge">
                <span class="hero__badge-label">Текущий баланс</span>
                <span class="hero__badge-value">{{ formatAmount(balance) }}</span>
                <span class="hero__badge-meta">Обновлено {{ formatDate(balanceUpdatedAt) }}</span>
            </div>
        </section>

        <v-row class="stat-cards" align="stretch" dense>
            <v-col cols="12" md="4">
                <v-card class="stat-card" elevation="2">
                    <v-icon icon="mdi-wallet" color="primary" class="stat-card__icon" />
                    <div class="stat-card__body">
                        <p class="stat-card__label">Текущий баланс</p>
                        <p class="stat-card__value">{{ formatAmount(balance) }}</p>
                        <p class="stat-card__meta">Последнее изменение {{ formatDate(balanceUpdatedAt) }}</p>
                    </div>
                </v-card>
            </v-col>
            <v-col cols="12" md="4">
                <v-card class="stat-card" elevation="2">
                    <v-icon icon="mdi-cash-multiple" color="primary" class="stat-card__icon" />
                    <div class="stat-card__body">
                        <p class="stat-card__label">Расходы за всё время</p>
                        <p class="stat-card__value">{{ formatAmount(totalExpenses) }}</p>
                        <p class="stat-card__meta" v-if="lastTransaction">
                            Последняя запись: {{ formatDate(lastTransaction.date) }}
                        </p>
                        <p class="stat-card__meta" v-else>
                            Добавьте первую запись, чтобы увидеть динамику.
                        </p>
                    </div>
                </v-card>
            </v-col>
            <v-col cols="12" md="4">
                <v-card class="stat-card" elevation="2">
                    <v-icon icon="mdi-shape-plus" color="primary" class="stat-card__icon" />
                    <div class="stat-card__body">
                        <p class="stat-card__label">Категории</p>
                        <p class="stat-card__value">{{ categoryCount }}</p>
                        <p class="stat-card__meta" v-if="lastTransaction">
                            Текущая категория: {{ lastTransaction.category.name }}
                        </p>
                        <p class="stat-card__meta" v-else>
                            Настройте категории под себя.
                        </p>
                    </div>
                </v-card>
            </v-col>
        </v-row>

        <section class="transactions-section">
            <div class="section-header">
                <div>
                    <h2>Последние операции</h2>
                    <p>Отображаются шесть последних транзакций для быстрого контроля.</p>
                </div>
                <v-btn variant="text" color="primary" rounded="lg" class="history-button">
                    Вся история (скоро)
                </v-btn>
            </div>

            <v-row v-if="transactions.length" class="transactions" dense>
                <v-col v-for="transaction in getLatestTransactions(6)" :key="transaction.id" cols="12" md="6" lg="4">
                    <v-card class="transaction-card" elevation="2">
                        <v-card-title class="transaction-card__title">
                            {{ transaction.category.name }}
                        </v-card-title>
                        <v-card-subtitle>
                            {{ formatDate(transaction.date) }}
                        </v-card-subtitle>
                        <v-card-text>
                            <div class="transaction-card__amount">
                                {{ formatAmount(transaction.amount) }}
                            </div>
                            <div class="transaction-card__meta">
                                {{ transaction.comment || '' }}
                            </div>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
            <v-alert v-else class="transactions-empty" type="info" variant="tonal" color="primary">
                Пока нет операций — добавьте первую запись, чтобы увидеть динамику.
            </v-alert>
        </section>

        <v-dialog v-model="state.openWriteDialog">
            <v-card>
                <v-card-title>
                    Добавление новой записи
                </v-card-title>
                <v-card-subtitle v-if="state.findError" class="text-error">
                    <v-icon icon="$error" />
                    Пожалуйста, заполните все поля
                </v-card-subtitle>
                <v-card-text>
                    <v-text-field label="Сумма" v-model="state.recordSum"></v-text-field>
                    <v-select label="Категория" :items="categoryVariables" v-model="state.recordCategory"></v-select>
                    <v-text-field label="Комментарий (Не обязательно)" v-model="state.recordName"></v-text-field>
                </v-card-text>
                <v-card-actions class="dialog-actions">
                    <v-checkbox class="dialog-actions__checkbox" color="primary" density="compact" hide-details
                        v-model="state.subtractFromBalance" label="Уменьшить баланс?" />
                    <v-spacer />
                    <v-btn color="error" @click="state.openWriteDialog = false">Отмена</v-btn>
                    <v-btn color="success" @click="saveRecorsToStorage()">Добавить</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="state.openBalanceDialog" width="400">
            <v-card>
                <v-card-title>Обновить баланс</v-card-title>
                <v-card-text>
                    <v-text-field label="Новый баланс" v-model="state.balanceDraft" type="number"
                        prepend-inner-icon="mdi-currency-rub" />
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn variant="text" @click="closeBalanceDialog">Отмена</v-btn>
                    <v-btn color="primary" @click="applyBalance">
                        Сохранить
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import { useTransactionStore } from '@/store/transactionStore'

import type { Category } from '@/type/Category';
import type { Transaction } from '@/type/Transaction';

const state = reactive({
    openWriteDialog: false,
    recordName: '',
    recordSum: '',
    recordCategory: '',
    findError: false,
    openBalanceDialog: false,
    balanceDraft: '',
    subtractFromBalance: false,
})

const categoryVariables = reactive([
    'Продукты',
    'Медицина',
    'Хобби',
    'Красота',
])

const categories = [
    { name: 'Продукты', color: '#4caf50' },
    { name: 'Медицина', color: '#ff9800' },
    { name: 'Хобби', color: '#03a9f4' },
    { name: 'Красота', color: '#9c27b0' },
] as Category[]

const transactionStore = useTransactionStore()
const transactions = computed(() => transactionStore.getTransactions)
const balance = computed(() => transactionStore.balance)
const balanceUpdatedAt = computed(() => transactionStore.balanceUpdatedAt)
const totalExpenses = computed(() =>
    transactions.value.reduce((sum, transaction) => sum + transaction.amount, 0),
)
const lastTransaction = computed(() => transactions.value[0] ?? null)
const categoryCount = computed(() => {
    if (!transactions.value.length) {
        return categories.length
    }
    return new Set(transactions.value.map((transaction) => transaction.category.name)).size
})

function getLatestTransactions(maxCount: number): Transaction[] {
    return transactions.value.slice(0, maxCount)
}

function saveRecorsToStorage() {
    if (!validateReoord()) {
        return
    }

    const amountValue = Number(state.recordSum)
    const category = findCategoryByName(state.recordCategory)

    transactionStore.addTransaction({
        id: crypto.randomUUID(),
        amount: amountValue,
        category,
        date: new Date().toISOString(),
        comment: state.recordName,
    })

    if (state.subtractFromBalance) {
        withdrawBalance(amountValue)
    }

    state.openWriteDialog = false
    state.recordName = ''
    state.recordSum = ''
    state.recordCategory = ''
}

function openBalanceDialog() {
    state.balanceDraft = String(balance.value)
    state.openBalanceDialog = true
}

function closeBalanceDialog() {
    state.openBalanceDialog = false
    state.balanceDraft = ''
}

function withdrawBalance(amount: number) {
    if (Number.isNaN(amount)) {
        return
    }

    const currentBalance = balance.value
    const newBalance = Math.max(0, currentBalance - amount)
    transactionStore.setBalance(newBalance)
}

function applyBalance() {
    const numericValue = Number(state.balanceDraft)
    if (Number.isNaN(numericValue)) {
        return
    }

    transactionStore.setBalance(numericValue)
    closeBalanceDialog()
}

function validateReoord() {
    if (state.recordSum === '' || state.recordCategory === '') {
        state.findError = true
        return false
    }
    return true
}

function findCategoryByName(name: string): Category {
    return categories.find((category) => category.name === name) || categories[0] 
}

function formatDate(date: string) {
    return new Date(date).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    })
}

function formatAmount(amount: number) {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        maximumFractionDigits: 0,
    }).format(amount)
}

</script>

<style src="./HomeStyle.css"></style>