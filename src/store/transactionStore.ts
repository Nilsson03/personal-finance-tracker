import { defineStore } from "pinia";
import type { Transaction } from "../type/Transaction"

export const useTransactionStore = defineStore('transactions', {
    state: () => ({
        transactions: [] as Transaction[],
        balance: 0,
        balanceUpdatedAt: new Date().toISOString(),
    }),
    getters: {
        getTransactions: (state) => state.transactions
    },
    actions: {
        addTransaction(transaction: Transaction) {
            this.transactions.push(transaction)
        },
        setBalance(value: number) {
            this.balance = value
            this.balanceUpdatedAt = new Date().toISOString()
        }
    },
})