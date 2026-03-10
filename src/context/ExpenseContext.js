import React, { createContext, useState, useEffect, useContext } from 'react';
import * as storage from '../services/storage';

const ExpenseContext = createContext();

export const useExpenses = () => {
    const context = useContext(ExpenseContext);
    if (!context) {
        throw new Error('useExpenses must be used within an ExpenseProvider');
    }
    return context;
};

export const ExpenseProvider = ({ children }) => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [monthlyBudgets, setMonthlyBudgets] = useState({});

    useEffect(() => {
        loadExpenses();
        loadBudgets();
    }, []);

    const loadExpenses = async () => {
        setLoading(true);
        try {
            const data = await storage.getExpenses();
            setExpenses(data);
        } catch (error) {
            console.error('Failed to load expenses:', error);
        } finally {
            setLoading(false);
        }
    };


    const loadBudgets = async () => {
        try {
            const data = await storage.getMonthlyBudgets();
            setMonthlyBudgets(data);
        } catch (error) {
            console.error('Failed to load budgets:', error);
        }
    };

    const setBudget = async (monthKey, amount) => {
        try {
            const updatedBudgets = await storage.setMonthlyBudget(monthKey, amount);
            setMonthlyBudgets(updatedBudgets);
            return updatedBudgets;
        } catch (error) {
            console.error('Failed to set budget:', error);
            throw error;
        }
    };

    const getBudget = (monthKey) => monthlyBudgets[monthKey] || 0;

    const addExpense = async (expenseData) => {
        try {
            const newExpense = await storage.saveExpense(expenseData);
            setExpenses(prev => [newExpense, ...prev]);
            return newExpense;
        } catch (error) {
            console.error('Failed to add expense:', error);
            throw error;
        }
    };

    const updateExpense = async (updatedData) => {
        try {
            const updated = await storage.updateExpense(updatedData);
            setExpenses(prev => prev.map(exp => exp.id === updated.id ? updated : exp));
            return updated;
        } catch (error) {
            console.error('Failed to update expense:', error);
            throw error;
        }
    };

    const deleteExpense = async (id) => {
        try {
            await storage.deleteExpense(id);
            setExpenses(prev => prev.filter(exp => exp.id !== id));
        } catch (error) {
            console.error('Failed to delete expense:', error);
            throw error;
        }
    };

    const getStats = (startDate, endDate) => {
        const filtered = expenses.filter(exp => {
            const date = new Date(exp.date);
            return date >= startDate && date <= endDate;
        });

        const income = filtered
            .filter(exp => exp.type === 'income')
            .reduce((sum, exp) => sum + (exp.amount || 0), 0);

        const expense = filtered
            .filter(exp => !exp.type || exp.type === 'expense')
            .reduce((sum, exp) => sum + (exp.amount || 0), 0);

        const byExpense = filtered
            .filter(exp => !exp.type || exp.type === 'expense')
            .reduce((acc, exp) => {
                if (!acc[exp.categoryId]) {
                    acc[exp.categoryId] = 0;
                }
                acc[exp.categoryId] += exp.amount;
                return acc;
            }, {});

        const byIncome = filtered
            .filter(exp => exp.type === 'income')
            .reduce((acc, exp) => {
                if (!acc[exp.categoryId]) {
                    acc[exp.categoryId] = 0;
                }
                acc[exp.categoryId] += exp.amount;
                return acc;
            }, {});

        return {
            total: expense,
            income,
            expense,
            balance: income - expense,
            byExpense,
            byIncome,
            count: filtered.length
        };
    };



    return (
        <ExpenseContext.Provider
            value={{
                expenses,
                loading,
                addExpense,
                updateExpense,
                deleteExpense,
                refreshExpenses: loadExpenses,
                getStats,
                monthlyBudgets,
                getBudget,
                setBudget,
            }}
        >
            {children}
        </ExpenseContext.Provider>
    );
};
