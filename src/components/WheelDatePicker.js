import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    ScrollView,
    Pressable,
} from 'react-native';
import colors from '../constants/colors';
import * as Haptics from 'expo-haptics';

const PICKER_HEIGHT = 220;
const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;

// 单个滚轮组件
const WheelColumn = ({ data, selectedValue, onSelect, width, scrollRef }) => {
    const initialIndex = data.indexOf(selectedValue);

    useEffect(() => {
        if (scrollRef?.current && initialIndex >= 0) {
            setTimeout(() => {
                scrollRef.current.scrollTo({
                    y: initialIndex * ITEM_HEIGHT,
                    animated: false,
                });
            }, 100);
        }
    }, []);

    const handleScroll = (event) => {
        const y = event.nativeEvent.contentOffset.y;
        const index = Math.round(y / ITEM_HEIGHT);
        if (index >= 0 && index < data.length) {
            onSelect(data[index]);
        }
    };

    const handleItemPress = (value, index) => {
        Haptics.selectionAsync();
        onSelect(value);
        scrollRef.current?.scrollTo({ y: index * ITEM_HEIGHT, animated: true });
    };

    return (
        <View style={[styles.wheelContainer, { width }]}>
            {/* 渐变遮罩 */}
            <View style={styles.maskTop} />
            <View style={styles.maskBottom} />

            {/* 选中线 */}
            <View style={styles.selectionLine} />

            <ScrollView
                ref={scrollRef}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                onScroll={handleScroll}
                scrollEventThrottle={16}
                contentContainerStyle={{
                    paddingVertical: (VISIBLE_ITEMS - 1) / 2 * ITEM_HEIGHT,
                }}
            >
                {data.map((item) => {
                    const isSelected = item === selectedValue;
                    return (
                        <TouchableOpacity
                            key={item}
                            onPress={() => handleItemPress(item, data.indexOf(item))}
                            activeOpacity={0.7}
                        >
                            <View
                                style={[
                                    styles.wheelItem,
                                    { height: ITEM_HEIGHT },
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.wheelItemText,
                                        isSelected && styles.wheelItemTextSelected,
                                    ]}
                                >
                                    {item < 10 ? `0${item}` : item}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const WheelDatePicker = ({ visible, initialDate, onConfirm, onCancel }) => {
    const [date, setDate] = useState(initialDate || new Date());
    const [year, setYear] = useState(date.getFullYear());
    const [month, setMonth] = useState(date.getMonth());
    const [day, setDay] = useState(date.getDate());

    const yearScrollRef = useRef(null);
    const monthScrollRef = useRef(null);
    const dayScrollRef = useRef(null);

    const currentYear = new Date().getFullYear();
    const minYear = currentYear - 10;
    const maxYear = currentYear;

    // 生成年份数组
    const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i);

    // 生成月份数组
    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    // 根据选中的年月生成天数数组
    const getDaysInMonth = (y, m) => {
        const daysInMonth = new Date(y, m, 0).getDate();
        return Array.from({ length: daysInMonth }, (_, i) => i + 1);
    };

    const days = getDaysInMonth(year, month);

    // 当日期变化时更新天数
    useEffect(() => {
        const maxDay = days.length;
        if (day > maxDay) {
            setDay(maxDay);
        }
    }, [year, month]);

    const handleConfirm = () => {
        Haptics.selectionAsync();
        const selectedDate = new Date(year, month, day);
        onConfirm(selectedDate);
    };

    const handleCancel = () => {
        Haptics.selectionAsync();
        onCancel();
    };

    if (!visible) return null;

    return (
        <Modal
            transparent={true}
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
                        <Text style={styles.title}>选择日期</Text>
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
                            width={80}
                            scrollRef={yearScrollRef}
                        />
                        <WheelColumn
                            data={months}
                            selectedValue={month + 1}
                            onSelect={(v) => setMonth(v - 1)}
                            width={60}
                            scrollRef={monthScrollRef}
                        />
                        <WheelColumn
                            data={days}
                            selectedValue={day}
                            onSelect={setDay}
                            width={60}
                            scrollRef={dayScrollRef}
                        />
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
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
    pickerContainer: {
        backgroundColor: '#222222',
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
    wheelContainer: {
        height: PICKER_HEIGHT,
        position: 'relative',
    },
    maskTop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: PICKER_HEIGHT / 2 - ITEM_HEIGHT / 2,
        // backgroundColor: colors.card,
        opacity: 0.9,
        zIndex: 1,
    },
    maskBottom: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: PICKER_HEIGHT / 2 - ITEM_HEIGHT / 2,
        // backgroundColor: colors.card,
        opacity: 0.9,
        zIndex: 1,
    },
    selectionLine: {
        position: 'absolute',
        top: PICKER_HEIGHT / 2 - ITEM_HEIGHT / 2,
        left: 10,
        right: 10,
        height: ITEM_HEIGHT,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        backgroundColor: colors.backgroundSecondary + '30',
        zIndex: 0,
    },
    wheelItem: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    wheelItemText: {
        fontSize: 20,
        color: colors.textMuted,
        fontWeight: '400',
    },
    wheelItemTextSelected: {
        fontSize: 24,
        color: colors.textPrimary,
        fontWeight: '700',
    },
});

export { WheelColumn };
export default WheelDatePicker;
