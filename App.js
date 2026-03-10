import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as Updates from 'expo-updates';


import HomeScreen from './src/screens/HomeScreen';
import AddExpenseScreen from './src/screens/AddExpenseScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import StatsScreen from './src/screens/StatsScreen';
import colors from './src/constants/colors';
import { ExpenseProvider } from './src/context/ExpenseContext';

const Tab = createBottomTabNavigator();

// 自定义中间添加按钮
const AddButton = ({ onPress }) => (
  <TouchableOpacity style={styles.addButton} onPress={onPress}>
    <View style={styles.addButtonInner}>
      <Ionicons name="add" size={32} color="#fff" />
    </View>
  </TouchableOpacity>
);

export default function App() {
  useEffect(() => {
    async function onFetchUpdateAsync() {
      try {
        const update = await Updates.checkForUpdateAsync();

        if (update.isAvailable) {
          Alert.alert(
            '发现新版本',
            '是否立即下载并重启应用以应用更新？',
            [
              { text: '稍后', style: 'cancel' },
              {
                text: '立即更新',
                onPress: async () => {
                  try {
                    await Updates.fetchUpdateAsync();
                    await Updates.reloadAsync();
                  } catch (error) {
                    Alert.alert('错误', '更新下载失败，请稍后重试');
                  }
                }
              }
            ]
          );
        }
      } catch (error) {
        // 忽略开发环境下的更新检测错误
        if (!__DEV__) {
          console.error("Error fetching latest Expo update:", error);
        }
      }
    }

    if (!__DEV__) {
      onFetchUpdateAsync();
    }
  }, []);

  return (

    <ExpenseProvider>
      <NavigationContainer>
        <StatusBar style="light" />

        <Tab.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: colors.background,
              elevation: 0,
              shadowOpacity: 0,
              borderBottomWidth: 0,
            },
            headerTintColor: colors.textPrimary,
            headerTitleStyle: {
              fontWeight: '700',
              fontSize: 18,
            },
            tabBarStyle: {
              backgroundColor: colors.backgroundSecondary,
              borderTopWidth: 0,
              height: 88,
              paddingBottom: 28,
              paddingTop: 12,
            },
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.textMuted,
            tabBarLabelStyle: {
              fontSize: 11,
              fontWeight: '500',
            },
          }}
        >
          <Tab.Screen
            name="Home"
            component={HomeScreen}
            options={{
              title: '记账',
              tabBarLabel: '首页',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="home-outline" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="History"
            component={HistoryScreen}
            options={{
              title: '历史记录',
              tabBarLabel: '历史',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="time-outline" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Add"
            component={AddExpenseScreen}
            options={({ navigation }) => ({
              title: '添加支出',
              tabBarLabel: '',
              tabBarIcon: () => null,
              tabBarButton: (props) => (
                <AddButton onPress={() => navigation.navigate('Add')} />
              ),
            })}
          />
          <Tab.Screen
            name="Stats"
            component={StatsScreen}
            options={{
              title: '统计',
              tabBarLabel: '统计',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="stats-chart-outline" size={size} color={color} />
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </ExpenseProvider>
  );
}

const styles = StyleSheet.create({
  addButton: {
    top: -20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
});
