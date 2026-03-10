import React, { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const CustomDatePicker = ({ visible, initialDate, onConfirm, onCancel }) => {
    const [date, setDate] = useState(initialDate);

    // Sync date state when initialDate changes externally
    useEffect(() => {
        setDate(initialDate);
    }, [initialDate]);

    const handleChange = (event, selectedDate) => {
        if (Platform.OS === 'android') {
            // On Android, the picker is a dialog that auto-dismisses
            if (selectedDate) {
                onConfirm(selectedDate);
            } else {
                onCancel();
            }
        } else {
            // On iOS, the picker is inline, user must confirm/cancel
            if (event.type === 'dismissed') {
                onCancel();
            } else if (event.type === 'set' && selectedDate) {
                onConfirm(selectedDate);
            }
        }
    };

    if (!visible) {
        return null;
    }

    return (
        <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'compact' : 'default'}
            onChange={handleChange}
            maximumDate={new Date()}
            locale="zh_CN"
            style={{ width: 120 }}
        />
    );
};

export default CustomDatePicker;
