import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
    Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import WheelDatePicker from '../components/WheelDatePicker';
import colors from '../constants/colors';
import CategoryPicker from '../components/CategoryPicker';
import { useExpenses } from '../context/ExpenseContext';
import * as Haptics from 'expo-haptics';


const AddExpenseScreen = ({ navigation, route }) => {
    const { addExpense, updateExpense } = useExpenses();
    const existingExpense = route.params?.expense;
    const isEditing = !!existingExpense;

    const [amount, setAmount] = useState(existingExpense ? existingExpense.amount.toString() : '');
    const [categoryId, setCategoryId] = useState(existingExpense ? existingExpense.categoryId : 'food');
    const [note, setNote] = useState(existingExpense ? existingExpense.note : '');
    const [date, setDate] = useState(existingExpense ? new Date(existingExpense.date) : new Date());
    const [type, setType] = useState(existingExpense ? (existingExpense.type || 'expense') : 'expense');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    React.useLayoutEffect(() => {
        navigation.setOptions({
            title: isEditing ? (type === 'expense' ? '编辑支出' : '编辑收入') : (type === 'expense' ? '记一笔支出' : '记一笔收入'),
        });
    }, [navigation, isEditing, type]);

    const handleAmountChange = (text) => {
        // 只允许数字和小数点
        const cleaned = text.replace(/[^0-9.]/g, '');
        // 只允许一个小数点
        const parts = cleaned.split('.');
        if (parts.length > 2) return;
        // 限制小数位数为2
        if (parts[1] && parts[1].length > 2) return;
        setAmount(cleaned);
    };

    const onDateConfirm = (selectedDate) => {
        setDate(selectedDate);
        setShowDatePicker(false);
    };

    const handleSave = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            Alert.alert('提示', '请输入有效金额');
            return;
        }

        setIsSubmitting(true);
        try {
            const expenseData = {
                amount: parseFloat(amount),
                categoryId,
                note: note.trim(),
                date: date.toISOString(),
                type,
            };


            if (isEditing) {
                await updateExpense({
                    ...expenseData,
                    id: existingExpense.id,
                });
            } else {
                await addExpense(expenseData);
            }
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            navigation.goBack();

        } catch (error) {
            Alert.alert('错误', '保存失败，请重试');
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.content}>
                {/* 类型切换 */}
                <View style={styles.typeToggle}>
                    <TouchableOpacity
                        style={[styles.typeButton, type === 'expense' && styles.typeButtonActive]}
                        onPress={() => setType('expense')}
                    >
                        <Text style={[styles.typeText, type === 'expense' && styles.typeTextActive]}>支出</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.typeButton, type === 'income' && styles.typeButtonActiveIncome]}
                        onPress={() => setType('income')}
                    >
                        <Text style={[styles.typeText, type === 'income' && styles.typeTextActive]}>收入</Text>
                    </TouchableOpacity>
                </View>

                {/* 金额输入 */}
                <View style={styles.amountSection}>
                    <Text style={[styles.currencySymbol, type === 'income' && { color: colors.success || '#4CAF50' }]}>¥</Text>

                    <TextInput
                        style={styles.amountInput}
                        value={amount}
                        onChangeText={handleAmountChange}
                        placeholder="0.00"
                        placeholderTextColor={colors.textMuted}
                        keyboardType="decimal-pad"
                        autoFocus={!isEditing}
                    />
                </View>

                {/* 分类选择 */}
                <CategoryPicker selectedId={categoryId} onSelect={setCategoryId} />

                {/* 备注输入 */}
                <View style={styles.noteSection}>
                    <Text style={styles.label}>日期</Text>
                    <TouchableOpacity
                        style={styles.dateSelector}
                        onPress={() => {
                            Keyboard.dismiss();
                            setShowDatePicker(true);
                        }}
                    >
                        <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                        <Text style={styles.dateText}>
                            {date.toLocaleDateString('zh-CN', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </Text>
                    </TouchableOpacity>
                    <WheelDatePicker
                        visible={showDatePicker}
                        initialDate={date}
                        onConfirm={onDateConfirm}
                        onCancel={() => setShowDatePicker(false)}
                    />
                </View>

                {/* 备注输入 */}
                <View style={styles.noteSection}>
                    <Text style={styles.label}>备注</Text>
                    <TextInput
                        style={styles.noteInput}
                        value={note}
                        onChangeText={setNote}
                        placeholder="添加备注（可选）"
                        placeholderTextColor={colors.textMuted}
                        maxLength={50}
                    />
                </View>

                {/* 保存按钮 */}
                <TouchableOpacity
                    style={[styles.saveButton, isSubmitting && styles.saveButtonDisabled]}
                    onPress={handleSave}
                    disabled={isSubmitting}
                >
                    <Ionicons name="checkmark" size={24} color="#fff" />
                    <Text style={styles.saveButtonText}>
                        {isSubmitting ? '保存中...' : '保存'}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        padding: 20,
        paddingTop: 20,
    },
    typeToggle: {
        flexDirection: 'row',
        backgroundColor: colors.backgroundSecondary,
        borderRadius: 16,
        padding: 4,
        marginBottom: 30,
    },
    typeButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 12,
    },
    typeButtonActive: {
        backgroundColor: colors.primary,
    },
    typeButtonActiveIncome: {
        backgroundColor: colors.success,
    },
    typeText: {
        color: colors.textSecondary,
        fontSize: 15,
        fontWeight: '600',
    },
    typeTextActive: {
        color: '#fff',
    },
    amountSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
        paddingVertical: 20,
    },
    currencySymbol: {
        color: colors.primary,
        fontSize: 36,
        fontWeight: '300',
        marginRight: 8,
    },
    amountInput: {
        color: colors.textPrimary,
        fontSize: 56,
        fontWeight: '700',
        minWidth: 100,
        textAlign: 'center',
    },
    label: {
        color: colors.textSecondary,
        fontSize: 14,
        marginBottom: 12,
        marginLeft: 4,
    },
    noteSection: {
        marginBottom: 40,
    },
    noteInput: {
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 16,
        color: colors.textPrimary,
        fontSize: 16,
    },
    dateSelector: {
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateText: {
        color: colors.textPrimary,
        fontSize: 16,
        marginLeft: 12,
    },
    saveButton: {
        backgroundColor: colors.primary,
        borderRadius: 16,
        padding: 18,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    saveButtonDisabled: {
        opacity: 0.6,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
        marginLeft: 8,
    },
});

export default AddExpenseScreen;
