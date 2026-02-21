import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface ExpenseInput {
    expenseType: string;
    submitterName: string;
    date: Time;
    amount: bigint;
}
export interface Expense {
    id: bigint;
    expenseType: string;
    submitterName: string;
    date: Time;
    createdAt: Time;
    updatedAt: Time;
    amount: bigint;
}
export interface UserProfile {
    name: string;
}
export type ExpenseId = bigint;
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createExpense(input: ExpenseInput): Promise<Expense>;
    deleteExpense(id: ExpenseId): Promise<void>;
    getAllExpenses(): Promise<Array<Expense>>;
    /**
     * / Returns the total expense amount from the earliest recorded expense year up to the current year.
     */
    getAllYearsTotalToNow(): Promise<bigint>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDailyTotal(date: Time): Promise<bigint>;
    /**
     * / Returns all expenses within a specified date range (inclusive).
     */
    getExpensesInRange(startDate: Time, endDate: Time): Promise<Array<Expense>>;
    /**
     * / Returns the total expense amount for the current month up to now.
     */
    getMonthlyTotalToNow(): Promise<bigint>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    /**
     * / Returns the total expense amount for the current year up to now.
     */
    getYearlyTotalToNow(): Promise<bigint>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateExpense(id: ExpenseId, input: ExpenseInput): Promise<Expense>;
}
