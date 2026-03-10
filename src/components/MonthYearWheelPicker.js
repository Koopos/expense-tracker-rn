import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Pressable,
} from 'react-native';
import colors from '../constants/colors';
import * as Haptics from 'expo-haptics';
import { WheelColumn } from './WheelDatePicker';

const PICKER_HEIGHT = 220;
const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;

const MonthYearWheelPicker = ({ visible, initialDate, mode = 'month', onConfirm, onCancel }) => {
    const [date, setDate] = useState(initialDate || new Date());
    const [year, setYear] = useState(date.getFullYear());
    const [month, setMonth] = useState(date.getMonth());

    const yearScrollRef = useRef(null);
    const monthScrollRef = useRef(null);

    const currentYear = new Date().getFullYear();
    const minYear = currentYear - 10;
    const maxYear = currentYear;

    // 生成年份数组
    const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i);

    // 生成月份数组
    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    const handleConfirm = () => {
        Haptics.selectionAsync();
        const selectedDate = new Date(year, month, 1);
        onConfirm(selectedDate);
    };

    const handleCancel = () => {
        Haptics.selectionAsync();
        onCancel();
    };

    if (!visible) return null;

    return (
        <Modal
            transparent
            visible={visible}
            animationType="slide"
            onRequestClose={onCancel}
        >
            <Pressable style={styles.modalContainer} onPress={handleCancel}>
                <Pressable style={styles.pickerContainer} onPress={(e) => e.stopPropagation()}>
                    {/* 头部按钮 */}
                    <View style={styles.header}>
                        <TouchableOpacity
                            style={styles.headerButton}
                            onPress={handleCancel}
                        >
                            <Text style={styles.cancelButton}>取消</Text>
                        </TouchableOpacity>
                        <Text style={styles.title}>{mode === 'month' ? '选择年月' : '选择年份'}</Text>
                        <TouchableOpacity
                            style={styles.headerButton}
                            onPress={handleConfirm}
                        >
                            <Text style={styles.confirmButton}>确定</Text>
                        </TouchableOpacity>
                    </View>

                    {/* 滚轮选择器 */}
                    <View style={styles.wheelsWrapper}>
                        <WheelColumn
                            data={years}
                            selectedValue={year}
                            onSelect={setYear}
                            width={mode === 'year' ? 200 : 100}
                            scrollRef={yearScrollRef}
                        />
                        {mode === 'month' && (
                            <WheelColumn
                                data={months}
                                selectedValue={month + 1}
                                onSelect={(v) => setMonth(v - 1)}
                                width={80}
                                scrollRef={monthScrollRef}
                            />
                        )}
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
    },
    pickerContainer: {
        backgroundColor: colors.card,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingBottom: 34,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    headerButton: {
        paddingVertical: 8,
        paddingHorizontal: 4,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    cancelButton: {
        fontSize: 16,
        color: colors.textSecondary,
    },
    confirmButton: {
        fontSize: 16,
        color: colors.primary,
        fontWeight: '600',
    },
    wheelsWrapper: {
        flexDirection: 'row',
        justifyContent: 'center',
        height: PICKER_HEIGHT,
        paddingHorizontal: 20,
    },
});

export default MonthYearWheelPicker;
