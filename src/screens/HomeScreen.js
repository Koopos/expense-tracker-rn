import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    Modal,
    TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import colors, { gradients } from '../constants/colors';
import { useExpenses } from '../context/ExpenseContext';
import { formatAmount, getMonthStart, getMonthEnd } from '../utils/helpers';
import ExpenseItem from '../components/ExpenseItem';
import * as Haptics from 'expo-haptics';

const getCurrentMonthKey = () => {
    const now = new Date();
    const month = `${now.getMonth() + 1}`.padStart(2, '0');
    return `${now.getFullYear()}-${month}`;
};

const HomeScreen = ({ navigation }) => {
    const { expenses, getStats, deleteExpense, refreshExpenses, getBudget, setBudget } = useExpenses();
    const [stats, setStats] = useState({ total: 0, income: 0, expense: 0, balance: 0 });
    const [refreshing, setRefreshing] = useState(false);
    const [budgetModalVisible, setBudgetModalVisible] = useState(false);
    const [budgetInput, setBudgetInput] = useState('');

    const monthKey = getCurrentMonthKey();
    const monthlyBudget = getBudget(monthKey);
    const budgetUsedRate = monthlyBudget > 0 ? Math.min((stats.expense / monthlyBudget) * 100, 100) : 0;
    const budgetRemaining = Math.max(monthlyBudget - stats.expense, 0);
    const isOverBudget = monthlyBudget > 0 && stats.expense > monthlyBudget;

    useEffect(() => {
        const currentStats = getStats(getMonthStart(), getMonthEnd());
        setStats(currentStats);
    }, [expenses, getStats]);

    const onRefresh = async () => {
        setRefreshing(true);
        await refreshExpenses();
        setRefreshing(false);
    };

    const handleDelete = async (id) => {
        await deleteExpense(id);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    };

    const openBudgetModal = () => {
        setBudgetInput(monthlyBudget ? String(monthlyBudget) : '');
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

    const renderHeader = () => (
        <View style={styles.header}>
            <LinearGradient
                colors={gradients.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.balanceCard}
            >
                <View style={styles.balanceHeader}>
                    <View>
                        <Text style={styles.balanceLabel}>本月结余</Text>
                        <Text style={styles.balanceAmount}>{formatAmount(stats.balance)}</Text>
                    </View>
                    <View style={styles.monthBadge}>
                        <Text style={styles.monthText}>{new Date().getMonth() + 1}月</Text>
                    </View>
                </View>

                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <View style={styles.statIconContainer}>
                            <Ionicons name="arrow-down-circle" size={18} color="#fff" />
                        </View>
                        <View>
                            <Text style={styles.statLabel}>收入</Text>
                            <Text style={styles.statValue}>{formatAmount(stats.income)}</Text>
                        </View>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <View style={styles.statIconContainer}>
                            <Ionicons name="arrow-up-circle" size={18} color="#fff" />
                        </View>
                        <View>
                            <Text style={styles.statLabel}>支出</Text>
                            <Text style={styles.statValue}>{formatAmount(stats.expense)}</Text>
                        </View>
                    </View>
                </View>
            </LinearGradient>

            <View style={styles.budgetCard}>
                <View style={styles.budgetHeader}>
                    <Text style={styles.budgetTitle}>本月预算</Text>
                    <TouchableOpacity onPress={openBudgetModal}>
                        <Text style={styles.budgetAction}>{monthlyBudget > 0 ? '修改' : '设置'}</Text>
                    </TouchableOpacity>
                </View>

                {monthlyBudget > 0 ? (
                    <>
                        <View style={styles.budgetRow}>
                            <Text style={styles.budgetMeta}>预算 {formatAmount(monthlyBudget)}</Text>
                            <Text style={[styles.budgetMeta, isOverBudget && styles.overBudgetText]}>
                                {isOverBudget ? `超支 ${formatAmount(stats.expense - monthlyBudget)}` : `剩余 ${formatAmount(budgetRemaining)}`}
                            </Text>
                        </View>
                        <View style={styles.progressTrack}>
                            <View
                                style={[
                                    styles.progressFill,
                                    {
                                        width: `${budgetUsedRate}%`,
                                        backgroundColor: isOverBudget ? colors.danger : colors.primary,
                                    },
                                ]}
                            />
                        </View>
                    </>
                ) : (
                    <Text style={styles.budgetEmpty}>设置月度预算后，可实时查看超支提醒。</Text>
                )}
            </View>

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>最近记录</Text>
                <TouchableOpacity onPress={() => navigation.navigate('History')}>
                    <Text style={styles.seeAll}>查看全部</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderEmpty = () => (
        <View style={styles.empty}>
            <Ionicons name="wallet-outline" size={64} color={colors.textMuted} />
            <Text style={styles.emptyText}>暂无支出记录</Text>
            <Text style={styles.emptySubtext}>点击下方按钮添加第一笔支出</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={expenses.slice(0, 10)}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <ExpenseItem
                        expense={item}
                        onDelete={handleDelete}
                        onPress={() => navigation.navigate('Add', { expense: item })}
                    />
                )}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={renderEmpty}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
            />

            <Modal visible={budgetModalVisible} transparent animationType="fade" onRequestClose={() => setBudgetModalVisible(false)}>
                <View style={styles.modalMask}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>设置本月预算</Text>
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
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    list: { padding: 20, paddingBottom: 100 },
    header: { marginBottom: 20 },
    balanceCard: { borderRadius: 24, padding: 28, marginBottom: 16 },
    balanceLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginBottom: 4 },
    balanceAmount: { color: '#fff', fontSize: 36, fontWeight: '700', letterSpacing: -1 },
    balanceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
    monthBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    monthText: { color: '#fff', fontSize: 14, fontWeight: '700' },
    statsRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 20, padding: 16 },
    statItem: { flex: 1, flexDirection: 'row', alignItems: 'center' },
    statIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    statLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, marginBottom: 2 },
    statValue: { color: '#fff', fontSize: 15, fontWeight: '700' },
    statDivider: { width: 1, height: 24, backgroundColor: 'rgba(255,255,255,0.1)', marginHorizontal: 15 },
    budgetCard: { backgroundColor: colors.card, borderRadius: 16, padding: 16, marginBottom: 24 },
    budgetHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' },
    budgetTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: '700' },
    budgetAction: { color: colors.primary, fontSize: 14, fontWeight: '600' },
    budgetRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    budgetMeta: { color: colors.textSecondary, fontSize: 13 },
    overBudgetText: { color: colors.danger },
    progressTrack: { height: 8, borderRadius: 4, backgroundColor: colors.backgroundSecondary, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 4 },
    budgetEmpty: { color: colors.textMuted, fontSize: 13 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sectionTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: '700' },
    seeAll: { color: colors.primary, fontSize: 14 },
    empty: { alignItems: 'center', paddingTop: 60 },
    emptyText: { color: colors.textSecondary, fontSize: 16, marginTop: 16 },
    emptySubtext: { color: colors.textMuted, fontSize: 13, marginTop: 4 },
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

export default HomeScreen;
