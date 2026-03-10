import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    Dimensions,
    TouchableOpacity,
    Modal,
    TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import { useExpenses } from '../context/ExpenseContext';
import MonthYearWheelPicker from '../components/MonthYearWheelPicker';
import { getCategoryById } from '../constants/categories';
import * as Haptics from 'expo-haptics';

import {
    formatAmount,
    getMonthStart,
    getMonthEnd,
    getYearStart,
    getYearEnd
} from '../utils/helpers';

const { width } = Dimensions.get('window');

const StatsScreen = () => {
    const { expenses, getStats: getStatsFromContext, refreshExpenses, getBudget, setBudget } = useExpenses();
    const [stats, setStats] = useState({ total: 0, income: 0, expense: 0, byExpense: {}, byIncome: {}, count: 0 });
    const [viewType, setViewType] = useState('month'); // 'month' | 'year'
    const [subViewType, setSubViewType] = useState('expense'); // 'expense' | 'income'
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showPicker, setShowPicker] = useState(false);

    const [refreshing, setRefreshing] = useState(false);
    const [budgetModalVisible, setBudgetModalVisible] = useState(false);
    const [budgetInput, setBudgetInput] = useState('');

    const monthKey = `${selectedDate.getFullYear()}-${`${selectedDate.getMonth() + 1}`.padStart(2, '0')}`;
    const selectedMonthBudget = getBudget(monthKey);
    const selectedMonthBudgetRate = selectedMonthBudget > 0 ? Math.min((stats.expense / selectedMonthBudget) * 100, 100) : 0;
    const selectedMonthOverBudget = selectedMonthBudget > 0 && stats.expense > selectedMonthBudget;

    useEffect(() => {
        const start = viewType === 'month' ? getMonthStart(selectedDate) : getYearStart(selectedDate);
        const end = viewType === 'month' ? getMonthEnd(selectedDate) : getYearEnd(selectedDate);
        const data = getStatsFromContext(start, end);
        setStats(data);
    }, [expenses, viewType, selectedDate, getStatsFromContext]);

    const onRefresh = async () => {
        setRefreshing(true);
        await refreshExpenses();
        setRefreshing(false);
    };

    const openBudgetModal = () => {
        setBudgetInput(selectedMonthBudget ? String(selectedMonthBudget) : '');
        setBudgetModalVisible(true);
    };

    const handleSaveBudget = async () => {
        const amount = Number(budgetInput);
        if (Number.isNaN(amount) || amount < 0) {
            return;
        }

        await setBudget(monthKey, amount);
        setBudgetModalVisible(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    };

    // 获取排序后的分类统计
    const currentData = subViewType === 'expense' ? stats.byExpense : stats.byIncome;
    const currentTotal = subViewType === 'expense' ? stats.expense : stats.income;

    const sortedCategories = Object.entries(currentData || {})
        .map(([id, amount]) => ({
            ...getCategoryById(id),
            amount,
            percentage: currentTotal > 0 ? (amount / currentTotal) * 100 : 0,
        }))
        .sort((a, b) => b.amount - a.amount);


    return (
        <>
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.primary}
                    />
                }
            >
                {/* 统计周期切换 */}
                <View style={styles.toggleContainer}>
                    <TouchableOpacity
                        style={[styles.toggleButton, viewType === 'month' && styles.toggleButtonActive]}
                        onPress={() => {
                            setViewType('month');
                            setSelectedDate(new Date());
                            Haptics.selectionAsync();
                        }}
                    >
                        <Text style={[styles.toggleText, viewType === 'month' && styles.toggleTextActive]}>
                            按月统计
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.toggleButton, viewType === 'year' && styles.toggleButtonActive]}
                        onPress={() => {
                            setViewType('year');
                            setSelectedDate(new Date());
                            Haptics.selectionAsync();
                        }}
                    >
                        <Text style={[styles.toggleText, viewType === 'year' && styles.toggleTextActive]}>
                            按年统计
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* 收支切换 */}
                <View style={styles.subToggleContainer}>
                    <TouchableOpacity
                        style={[styles.subToggleButton, subViewType === 'expense' && styles.subToggleButtonActiveExpense]}
                        onPress={() => {
                            setSubViewType('expense');
                            Haptics.selectionAsync();
                        }}
                    >
                        <Text style={[styles.subToggleText, subViewType === 'expense' && styles.subToggleTextActive]}>
                            支出
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.subToggleButton, subViewType === 'income' && styles.subToggleButtonActiveIncome]}
                        onPress={() => {
                            setSubViewType('income');
                            Haptics.selectionAsync();
                        }}
                    >
                        <Text style={[styles.subToggleText, subViewType === 'income' && styles.subToggleTextActive]}>
                            收入
                        </Text>
                    </TouchableOpacity>
                </View>


                {/* 总览卡片 */}
                <TouchableOpacity
                    style={styles.summaryCard}
                    onPress={() => setShowPicker(true)}
                    activeOpacity={0.7}
                >
                    <View style={[styles.periodBadge, { backgroundColor: colors.primary + '20' }]}>
                        <Text style={styles.periodText}>
                            {viewType === 'month'
                                ? `${selectedDate.getFullYear()}年${selectedDate.getMonth() + 1}月`
                                : `${selectedDate.getFullYear()}年`
                            }
                        </Text>
                        <Ionicons name="chevron-down" size={14} color={colors.primary} style={{ marginLeft: 4 }} />
                    </View>
                    <Text style={styles.summaryLabel}>
                        {viewType === 'month'
                            ? (subViewType === 'expense' ? '月度总支出' : '月度总收入')
                            : (subViewType === 'expense' ? '年度总支出' : '年度总收入')
                        }
                    </Text>
                    <Text style={[styles.summaryAmount, subViewType === 'income' && { color: colors.success }]}>
                        {formatAmount(subViewType === 'expense' ? stats.expense : stats.income)}
                    </Text>
                    <Text style={styles.summaryCount}>共 {stats.count} 笔记录</Text>
                </TouchableOpacity>


                <MonthYearWheelPicker
                    visible={showPicker}
                    initialDate={selectedDate}
                    mode={viewType}
                    onConfirm={(date) => {
                        setSelectedDate(date);
                        setShowPicker(false);
                    }}
                    onCancel={() => setShowPicker(false)}
                />


                {viewType === 'month' && (
                    <View style={styles.budgetSummaryCard}>
                        <View style={styles.budgetSummaryHeader}>
                            <Text style={styles.budgetSummaryTitle}>月度预算执行</Text>
                            <TouchableOpacity onPress={openBudgetModal}>
                                <Text style={styles.budgetActionText}>{selectedMonthBudget > 0 ? '修改预算' : '设置预算'}</Text>
                            </TouchableOpacity>
                        </View>

                        {selectedMonthBudget > 0 ? (
                            <>
                                <Text style={[styles.budgetSummaryMeta, selectedMonthOverBudget && styles.budgetSummaryOver]}>
                                    {selectedMonthOverBudget
                                        ? `已超支 ${formatAmount(stats.expense - selectedMonthBudget)}`
                                        : `剩余 ${formatAmount(selectedMonthBudget - stats.expense)}`}
                                </Text>
                                <Text style={styles.budgetSummaryMeta}>预算 {formatAmount(selectedMonthBudget)} / 支出 {formatAmount(stats.expense)}</Text>
                                <View style={styles.budgetSummaryTrack}>
                                    <View
                                        style={[
                                            styles.budgetSummaryFill,
                                            {
                                                width: `${selectedMonthBudgetRate}%`,
                                                backgroundColor: selectedMonthOverBudget ? colors.danger : colors.primary,
                                            },
                                        ]}
                                    />
                                </View>
                            </>
                        ) : (
                            <Text style={styles.budgetEmptyText}>当前月份未设置预算，点击右上角“设置预算”。</Text>
                        )}
                    </View>
                )}

                {/* 分类统计 */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>分类明细</Text>

                    {sortedCategories.length === 0 ? (
                        <View style={styles.empty}>
                            <Ionicons name="pie-chart-outline" size={48} color={colors.textMuted} />
                            <Text style={styles.emptyText}>暂无统计数据</Text>
                        </View>
                    ) : (
                        sortedCategories.map((cat) => (
                            <View key={cat.id} style={styles.categoryItem}>
                                <View style={styles.categoryLeft}>
                                    <View style={[styles.categoryIcon, { backgroundColor: cat.color + '20' }]}>
                                        <Ionicons name={cat.icon} size={20} color={cat.color} />
                                    </View>
                                    <View style={styles.categoryInfo}>
                                        <View style={styles.categoryNameRow}>
                                            <Text style={styles.categoryName} numberOfLines={1} ellipsizeMode="tail">{cat.name}</Text>
                                            <Text style={styles.categoryPercentage}>
                                                {cat.percentage.toFixed(1)}%
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                                <View style={styles.categoryRight}>
                                    <View style={styles.progressBarContainer}>
                                        <View
                                            style={[
                                                styles.progressBar,
                                                { width: `${Math.min(cat.percentage, 100)}%`, backgroundColor: cat.color }
                                            ]}
                                        />
                                    </View>
                                    <View style={styles.categoryAmountWrapper}>
                                        <Text style={styles.categoryAmount}>{formatAmount(cat.amount)}</Text>
                                    </View>
                                </View>
                            </View>

                        ))
                    )}

                    {/* 简单柱形图 */}
                    {sortedCategories.length > 0 && (
                        <View style={styles.barChart}>
                            {sortedCategories.slice(0, 5).map((cat) => (
                                <View key={cat.id} style={styles.barItem}>
                                    <View style={styles.barContainer}>
                                        <View
                                            style={[
                                                styles.bar,
                                                {
                                                    height: `${Math.max(cat.percentage, 5)}%`,
                                                    backgroundColor: cat.color,
                                                },
                                            ]}
                                        />
                                    </View>
                                    <View style={[styles.barIcon, { backgroundColor: cat.color + '20' }]}>
                                        <Ionicons name={cat.icon} size={16} color={cat.color} />
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>

            <Modal visible={budgetModalVisible} transparent animationType="fade" onRequestClose={() => setBudgetModalVisible(false)}>
                <View style={styles.modalMask}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>设置预算（{selectedDate.getFullYear()}年{selectedDate.getMonth() + 1}月）</Text>
                        <TextInput
                            style={styles.modalInput}
                            value={budgetInput}
                            onChangeText={setBudgetInput}
                            keyboardType="numeric"
                            placeholder="请输入预算金额"
                            placeholderTextColor={colors.textMuted}
                        />
                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.modalBtn} onPress={() => setBudgetModalVisible(false)}>
                                <Text style={styles.modalBtnText}>取消</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalBtn, styles.modalBtnPrimary]} onPress={handleSaveBudget}>
                                <Text style={[styles.modalBtnText, { color: '#fff' }]}>保存</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        padding: 20,
        paddingBottom: 100,
    },
    summaryCard: {
        backgroundColor: colors.card,
        borderRadius: 24,
        padding: 28,
        alignItems: 'center',
        marginBottom: 20,
    },
    summaryLabel: {
        color: colors.textSecondary,
        fontSize: 14,
        marginBottom: 8,
    },
    summaryAmount: {
        color: colors.textPrimary,
        fontSize: 42,
        fontWeight: '700',
        letterSpacing: -1,
    },
    summaryCount: {
        color: colors.textMuted,
        fontSize: 13,
        marginTop: 12,
    },
    section: {
        backgroundColor: colors.card,
        borderRadius: 20,
        padding: 20,
    },
    sectionTitle: {
        color: colors.textPrimary,
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 20,
    },
    empty: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        color: colors.textMuted,
        fontSize: 14,
        marginTop: 12,
    },
    categoryItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    categoryLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 12,
    },
    categoryIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    categoryInfo: {
        flex: 1,
        marginLeft: 12,
    },
    categoryNameRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    categoryName: {
        color: colors.textPrimary,
        fontSize: 15,
        fontWeight: '500',
        flex: 1,
    },
    categoryPercentage: {
        color: colors.textMuted,
        fontSize: 12,
        marginLeft: 8,
    },
    categoryRight: {
        flexDirection: 'row',
        alignItems: 'center',
        minWidth: 120,
    },
    progressBarContainer: {
        height: 6,
        width: 50,
        backgroundColor: colors.backgroundSecondary,
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        borderRadius: 3,
    },

    categoryAmountWrapper: {
        marginLeft: 8,
    },
    categoryAmount: {
        color: colors.textPrimary,
        fontSize: 15,
        fontWeight: '600',
    },
    barChart: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'flex-end',
        height: 120,
        marginTop: 24,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    barItem: {
        alignItems: 'center',
        width: (width - 80) / 5,
    },
    barContainer: {
        width: 24,
        height: 80,
        justifyContent: 'flex-end',
        marginBottom: 8,
    },
    bar: {
        width: '100%',
        borderRadius: 6,
        minHeight: 4,
    },
    barIcon: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: colors.backgroundSecondary,
        borderRadius: 16,
        padding: 4,
        marginBottom: 24,
    },
    toggleButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 12,
    },
    toggleButtonActive: {
        backgroundColor: colors.primary,
    },
    toggleText: {
        color: colors.textSecondary,
        fontSize: 14,
        fontWeight: '600',
    },
    toggleTextActive: {
        color: '#fff',
    },
    subToggleContainer: {
        flexDirection: 'row',
        backgroundColor: colors.backgroundSecondary,
        borderRadius: 12,
        padding: 2,
        marginBottom: 24,
        width: 140,
        alignSelf: 'center',
    },
    subToggleButton: {
        flex: 1,
        paddingVertical: 6,
        alignItems: 'center',
        borderRadius: 10,
    },
    subToggleButtonActiveExpense: {
        backgroundColor: colors.primary,
    },
    subToggleButtonActiveIncome: {
        backgroundColor: colors.success,
    },
    subToggleText: {
        color: colors.textSecondary,
        fontSize: 13,
        fontWeight: '600',
    },
    subToggleTextActive: {
        color: '#fff',
    },
    periodBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
        marginBottom: 12,
    },
    periodText: {
        color: colors.primary,
        fontSize: 13,
        fontWeight: '700',
    },

    budgetSummaryCard: {
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 14,
        marginBottom: 16,
    },
    budgetSummaryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    budgetSummaryTitle: {
        color: colors.textPrimary,
        fontSize: 15,
        fontWeight: '700',
    },
    budgetActionText: {
        color: colors.primary,
        fontSize: 13,
        fontWeight: '700',
    },
    budgetSummaryMeta: {
        color: colors.textSecondary,
        fontSize: 12,
        marginBottom: 8,
    },
    budgetSummaryOver: {
        color: colors.danger,
    },
    budgetEmptyText: {
        color: colors.textMuted,
        fontSize: 13,
    },
    budgetSummaryTrack: {
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.backgroundSecondary,
        overflow: 'hidden',
    },
    budgetSummaryFill: {
        height: '100%',
        borderRadius: 4,
    },
    modalMask: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        padding: 24,
    },
    modalCard: { backgroundColor: colors.backgroundSecondary, borderRadius: 16, padding: 18 },
    modalTitle: { color: colors.textPrimary, fontSize: 17, fontWeight: '700', marginBottom: 12 },
    modalInput: {
        backgroundColor: colors.card,
        borderRadius: 12,
        color: colors.textPrimary,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        marginBottom: 14,
    },
    modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
    modalBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: colors.card },
    modalBtnPrimary: { backgroundColor: colors.primary },
    modalBtnText: { color: colors.textPrimary, fontWeight: '600' },
});

export default StatsScreen;
