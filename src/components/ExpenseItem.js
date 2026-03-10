import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getCategoryById } from '../constants/categories';
import colors from '../constants/colors';
import { formatAmount, formatDate } from '../utils/helpers';

const ExpenseItem = ({ expense, onDelete, onPress }) => {
    const category = getCategoryById(expense.categoryId);
    const isIncome = expense.type === 'income';

    const handleDelete = () => {
        Alert.alert(
            '删除记录',
            `确定要删除这笔 ${formatAmount(expense.amount)} 的${isIncome ? '收入' : '支出'}吗？`,
            [
                { text: '取消', style: 'cancel' },
                { text: '删除', style: 'destructive', onPress: () => onDelete(expense.id) },
            ]
        );
    };

    return (
        <TouchableOpacity style={styles.container} onLongPress={handleDelete} onPress={onPress}>
            <View style={[styles.iconContainer, { backgroundColor: category.color + '20' }]}>
                <Ionicons name={category.icon} size={24} color={category.color} />
            </View>
            <View style={styles.info}>
                <Text style={styles.category}>{category.name}</Text>
                {expense.note ? (
                    <Text style={styles.note} numberOfLines={1}>{expense.note}</Text>
                ) : null}
            </View>
            <View style={styles.right}>
                <Text style={[styles.amount, isIncome && styles.amountIncome]}>
                    {isIncome ? '+' : '-'}{formatAmount(expense.amount)}
                </Text>
                <Text style={styles.date}>{formatDate(expense.date)}</Text>
            </View>
        </TouchableOpacity>
    );
};


const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    info: {
        flex: 1,
        marginLeft: 12,
    },
    category: {
        color: colors.textPrimary,
        fontSize: 16,
        fontWeight: '600',
    },
    note: {
        color: colors.textSecondary,
        fontSize: 13,
        marginTop: 2,
    },
    right: {
        alignItems: 'flex-end',
    },
    amount: {
        color: colors.danger,
        fontSize: 16,
        fontWeight: '700',
    },
    amountIncome: {
        color: colors.success,
    },

    date: {
        color: colors.textMuted,
        fontSize: 12,
        marginTop: 2,
    },
});

export default ExpenseItem;
