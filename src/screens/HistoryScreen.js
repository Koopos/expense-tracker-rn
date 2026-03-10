import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SectionList,
    RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import { useExpenses } from '../context/ExpenseContext';
import { formatAmount, formatDate, groupByDate } from '../utils/helpers';
import ExpenseItem from '../components/ExpenseItem';

const HistoryScreen = ({ navigation }) => {
    const { expenses, deleteExpense, refreshExpenses } = useExpenses();
    const [sections, setSections] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        const grouped = groupByDate(expenses);
        const sectionData = grouped.map((group) => ({
            title: formatDate(group.date),
            netBalance: group.netBalance,
            data: group.items,
        }));
        setSections(sectionData);
    }, [expenses]);


    const onRefresh = async () => {
        setRefreshing(true);
        await refreshExpenses();
        setRefreshing(false);
    };

    const handleDelete = async (id) => {
        await deleteExpense(id);
    };


    const renderSectionHeader = ({ section }) => {
        const isPositive = section.netBalance >= 0;
        return (
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <Text style={[styles.sectionTotal, isPositive && styles.sectionTotalPositive]}>
                    {isPositive ? '+' : '-'}{formatAmount(Math.abs(section.netBalance))}
                </Text>
            </View>
        );
    };


    const renderEmpty = () => (
        <View style={styles.empty}>
            <Ionicons name="document-text-outline" size={64} color={colors.textMuted} />
            <Text style={styles.emptyText}>暂无历史记录</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <SectionList
                sections={sections}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <ExpenseItem
                        expense={item}
                        onDelete={handleDelete}
                        onPress={() => navigation.navigate('Add', { expense: item })}
                    />
                )}
                renderSectionHeader={renderSectionHeader}
                ListEmptyComponent={renderEmpty}
                contentContainerStyle={styles.list}
                stickySectionHeadersEnabled={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.primary}
                    />
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    list: {
        padding: 20,
        paddingBottom: 100,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        marginTop: 8,
    },
    sectionTitle: {
        color: colors.textSecondary,
        fontSize: 14,
        fontWeight: '600',
    },
    sectionTotal: {
        color: colors.danger,
        fontSize: 14,
        fontWeight: '600',
    },
    sectionTotalPositive: {
        color: colors.success,
    },

    empty: {
        alignItems: 'center',
        paddingTop: 100,
    },
    emptyText: {
        color: colors.textSecondary,
        fontSize: 16,
        marginTop: 16,
    },
});

export default HistoryScreen;
