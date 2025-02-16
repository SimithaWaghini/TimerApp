import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const HistoryScreen = () => {
  const [history, setHistory] = useState([]);
  const [nohistory, setNoHistory] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const loadHistory = async () => {
      const storedHistory = await AsyncStorage.getItem('timerHistory');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
        setNoHistory(false);
      }
      else {
        setNoHistory(true);
      }
    };
    loadHistory();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            navigation.goBack();
          }}
        >
          <Ionicons name={"arrow-back"} size={30} color={'white'} />
        </TouchableOpacity>
        <Text style={styles.headertext}>Timer History</Text>
      </View>
      <View style={styles.flatlistview}>
        {nohistory ? <View style={styles.emptyview}><Text style={{
          alignSelf: 'center', fontSize: 14,
          color: 'black'
        }}>There is no history yet</Text></View>
          : <FlatList
            data={history}
            keyExtractor={item => item.name}
            renderItem={({ item }) => (
              <View style={styles.listcontainer}>
                <Text style={styles.title}>Name : {item.name}</Text>
                <Text style={styles.title}>Completion Time : {item.completionTime}</Text>
              </View>
            )}
          />}
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    backgroundColor: '#4ba67a',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 10

  },
  headertext: {
    color: 'white',
    fontSize: 20,
    alignSelf: 'center',
    paddingVertical: 15,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  flatlistview: {
    marginVertical: 10,
    flex: 1,
  },
  title: {
    fontSize: 14,
    color: 'black'
  },
  listcontainer: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginVertical: 5,
    borderRadius: 5,
    backgroundColor: 'white',
    elevation: 5,
    marginHorizontal: 20
  },
  emptyview: {
    flex: 1,
    justifyContent: 'center',
  }
});
export default HistoryScreen;
