import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import categories from '../constants/categories';
import colors from '../constants/colors';

const CategoryPicker = ({ selectedId, onSelect }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>选择分类</Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {categories.map((category) => (
                    <TouchableOpacity
                        key={category.id}
                        style={[
                            styles.item,
                            selectedId === category.id && styles.itemSelected,
                        ]}
                        onPress={() => onSelect(category.id)}
                    >
                        <View
                            style={[
                                styles.iconContainer,
                                { backgroundColor: category.color + '20' },
                                selectedId === category.id && { backgroundColor: category.color + '40' },
                            ]}
                        >
                            <Ionicons
                                name={category.icon}
                                size={24}
                                color={category.color}
                            />
                        </View>
                        <Text
                            style={[
                                styles.name,
                                selectedId === category.id && styles.nameSelected,
                            ]}
                        >
                            {category.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    label: {
        color: colors.textSecondary,
        fontSize: 14,
        marginBottom: 12,
        marginLeft: 4,
    },
    scrollContent: {
        paddingHorizontal: 4,
    },
    item: {
        alignItems: 'center',
        marginRight: 16,
        padding: 8,
        borderRadius: 12,
    },
    itemSelected: {
        backgroundColor: colors.cardHover,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    name: {
        color: colors.textSecondary,
        fontSize: 12,
    },
    nameSelected: {
        color: colors.textPrimary,
        fontWeight: '600',
    },
});

export default CategoryPicker;
