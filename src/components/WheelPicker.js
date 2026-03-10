import React, { useRef, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Dimensions,
} from 'react-native';
import colors from '../constants/colors';

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;

const WheelPicker = ({ data, selectedValue, onValueChange }) => {
    const scrollViewRef = useRef(null);
    const isInternalUpdate = useRef(false);

    // Calculate initial index safely
    const getInitialIndex = () => {
        const index = data.findIndex(item => item.value === selectedValue);
        return index !== -1 ? index : 0;
    };

    const [activeIndex, setActiveIndex] = useState(getInitialIndex());

    useEffect(() => {
        const index = data.findIndex(item => item.value === selectedValue);
        if (index !== -1 && index !== activeIndex) {
            setActiveIndex(index);
            // Only scroll if this was an external update
            if (!isInternalUpdate.current) {
                const timer = setTimeout(() => {
                    scrollViewRef.current?.scrollTo({
                        y: index * ITEM_HEIGHT,
                        animated: true,
                    });
                }, 50);
                return () => clearTimeout(timer);
            }
        }
    }, [selectedValue, activeIndex, data.length, data]);

    const handleValueChange = (index) => {
        if (index >= 0 && index < data.length) {
            setActiveIndex(index);
            isInternalUpdate.current = true;
            onValueChange(data[index].value);
            // Reset after a short delay so external changes can still trigger scrollTo
            setTimeout(() => {
                isInternalUpdate.current = false;
            }, 100);
        }
    };

    const onMomentumScrollEnd = (event) => {
        const y = event.nativeEvent.contentOffset.y;
        const index = Math.round(y / ITEM_HEIGHT);
        // Force alignment to exactly match ITEM_HEIGHT multiples
        scrollViewRef.current?.scrollTo({
            y: Math.max(0, Math.min(index * ITEM_HEIGHT, (data.length - 1) * ITEM_HEIGHT)),
            animated: true,
        });
        handleValueChange(index);
    };

    const handleScroll = (event) => {
        const y = event.nativeEvent.contentOffset.y;
        const index = Math.round(y / ITEM_HEIGHT);
        if (index >= 0 && index < data.length && index !== activeIndex) {
            setActiveIndex(index);
            isInternalUpdate.current = true;
            onValueChange(data[index].value);
            setTimeout(() => {
                isInternalUpdate.current = false;
            }, 100);
        }
    };

    const totalHeight = ITEM_HEIGHT * data.length;

    return (
        <View style={styles.container}>
            {/* Selection indicator */}
            <View style={styles.selectionIndicator} />

            <ScrollView
                ref={scrollViewRef}
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                snapToAlignment="start"
                decelerationRate="fast"
                bounces={true}
                scrollEnabled={true}
                onMomentumScrollEnd={onMomentumScrollEnd}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                overScrollMode="always"
                contentContainerStyle={{
                    paddingTop: ITEM_HEIGHT * 2,
                    paddingBottom: ITEM_HEIGHT * 2,
                    minHeight: totalHeight + ITEM_HEIGHT * 4,
                }}
            >
                {data.map((item, index) => {
                    const isSelected = index === activeIndex;
                    return (
                        <View key={item.value} style={styles.item}>
                            <Text style={[
                                styles.itemText,
                                isSelected && styles.selectedItemText
                            ]}>
                                {item.label}
                            </Text>
                        </View>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: ITEM_HEIGHT * VISIBLE_ITEMS,
        width: Dimensions.get('window').width / 1.2,
        position: 'relative',
    },
    scrollView: {
        flex: 1,
    },
    selectionIndicator: {
        position: 'absolute',
        top: ITEM_HEIGHT * 2,
        left: 10,
        right: 10,
        height: ITEM_HEIGHT,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        zIndex: 1,
        pointerEvents: 'none',
    },
    item: {
        height: ITEM_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemText: {
        fontSize: 18,
        color: colors.textSecondary,
        textAlign: 'center',
        textAlignVertical: 'center',
        includeFontPadding: false,
    },
    selectedItemText: {
        fontSize: 22,
        fontWeight: '700',
        color: colors.primary,
        textAlign: 'center',
        textAlignVertical: 'center',
        includeFontPadding: false,
    },
});

export default WheelPicker;
