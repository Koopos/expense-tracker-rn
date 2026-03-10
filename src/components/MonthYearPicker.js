import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Pressable,
} from 'react-native';
import colors from '../constants/colors';
import WheelPicker from './WheelPicker';

const MonthYearPicker = ({ visible, initialDate, mode = 'month', onConfirm, onCancel }) => {
    const [year, setYear] = useState(initialDate.getFullYear());
    const [month, setMonth] = useState(initialDate.getMonth() + 1);

    // 当 initialDate 或 modal 显示时更新状态
    useEffect(() => {
        if (visible) {
            setYear(initialDate.getFullYear());
            setMonth(initialDate.getMonth() + 1);
        }
    }, [visible, initialDate]);

    // 年份范围：当前年份往前10年，使用 useMemo 避免重复创建
    const years = React.useMemo(() => {
        const currentYear = new Date().getFullYear();
        const result = [];
        for (let i = currentYear - 10; i <= currentYear; i++) {
            result.push({ label: `${i}年`, value: i });
        }
        return result.reverse(); // 最新的年份在上面
    }, []); // Empty deps since we only compute once

    // 12个月份，使用 useMemo 避免重复创建
    const months = React.useMemo(() => {
        const result = [];
        for (let i = 1; i <= 12; i++) {
            result.push({ label: `${i}月`, value: i });
        }
        return result;
    }, []);

    const handleConfirm = () => {
        const selectedDate = new Date(year, month - 1, 1);
        onConfirm(selectedDate);
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onCancel}
            statusBarTranslucent={true}
        >
            <Pressable
                style={styles.overlay}
                onPress={onCancel}
                android_ripple={null}
            >
                <Pressable
                    style={styles.modalContent}
                    onPress={(e) => e.stopPropagation()}
                    android_ripple={null}
                >
                    <View style={styles.header}>
                        <TouchableOpacity onPress={onCancel}>
                            <Text style={styles.cancelText}>取消</Text>
                        </TouchableOpacity>
                        <Text style={styles.title}>
                            {mode === 'month' ? '选择年月' : '选择年份'}
                        </Text>
                        <TouchableOpacity onPress={handleConfirm}>
                            <Text style={styles.confirmText}>确定</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={[
                        styles.pickerContainer,
                        mode === 'year' && styles.pickerContainerCenter
                    ]}>
                        <WheelPicker
                            data={years}
                            selectedValue={year}
                            onValueChange={setYear}
                        />
                        {mode === 'month' && (
                            <WheelPicker
                                data={months}
                                selectedValue={month}
                                onValueChange={setMonth}
                            />
                        )}
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.backgroundSecondary,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingBottom: 40,
        paddingTop: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    cancelText: {
        fontSize: 16,
        color: colors.textSecondary,
    },
    confirmText: {
        fontSize: 16,
        color: colors.primary,
        fontWeight: '600',
    },
    pickerContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginTop: 20,
        justifyContent: 'space-around',
    },
    pickerContainerCenter: {
        justifyContent: 'center',
    },
});

export default MonthYearPicker;
