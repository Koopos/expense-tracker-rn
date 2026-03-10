import AsyncStorage from '@react-native-async-storage/async-storage';

const EXPENSES_KEY = '@expenses';

// 生成唯一ID
const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// 获取所有支出记录
export const getExpenses = async () => {
    try {
        const data = await AsyncStorage.getItem(EXPENSES_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error getting expenses:', error);
        return [];
    }
};

// 保存新支出
export const saveExpense = async (expense) => {
    try {
        const expenses = await getExpenses();
        const newExpense = {
            ...expense,
            id: generateId(),
            createdAt: new Date().toISOString(),
        };
        expenses.unshift(newExpense); // 新记录放在最前面
        await AsyncStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
        return newExpense;
    } catch (error) {
        console.error('Error saving expense:', error);
        throw error;
    }
};

// 更新支出
export const updateExpense = async (updatedExpense) => {
    try {
        const expenses = await getExpenses();
        const index = expenses.findIndex(exp => exp.id === updatedExpense.id);
        if (index !== -1) {
            expenses[index] = {
                ...expenses[index],
                ...updatedExpense,
                updatedAt: new Date().toISOString(),
            };
            await AsyncStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
            return expenses[index];
        }
        throw new Error('Expense not found');
    } catch (error) {
        console.error('Error updating expense:', error);
        throw error;
    }
};

// 删除支出
export const deleteExpense = async (id) => {
    try {
        const expenses = await getExpenses();
        const filtered = expenses.filter(exp => exp.id !== id);
        await AsyncStorage.setItem(EXPENSES_KEY, JSON.stringify(filtered));
        return true;
    } catch (error) {
        console.error('Error deleting expense:', error);
        throw error;
    }
};

// 获取统计数据
export const getStats = async (startDate, endDate) => {
    try {
        const expenses = await getExpenses();
        const filtered = expenses.filter(exp => {
            const date = new Date(exp.date);
            return date >= startDate && date <= endDate;
        });

        const total = filtered.reduce((sum, exp) => sum + exp.amount, 0);

        const byCategory = filtered.reduce((acc, exp) => {
            if (!acc[exp.categoryId]) {
                acc[exp.categoryId] = 0;
            }
            acc[exp.categoryId] += exp.amount;
            return acc;
        }, {});

        return { total, byCategory, count: filtered.length };
    } catch (error) {
        console.error('Error getting stats:', error);
        return { total: 0, byCategory: {}, count: 0 };
    }
};

// 清空所有数据（调试用）
export const clearAll = async () => {
    try {
        await AsyncStorage.removeItem(EXPENSES_KEY);
        return true;
    } catch (error) {
        console.error('Error clearing data:', error);
        throw error;
    }
};
