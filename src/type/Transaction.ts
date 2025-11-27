import type { Category } from "./Category"

export type Transaction = {
    id: string,
    amount: number,
    category: Category,
    date: string
    comment: string
}