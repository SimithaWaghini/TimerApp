import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, TouchableOpacity, SafeAreaView, Modal } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import * as Progress from 'react-native-progress';
import Toast from 'react-native-toast-message';

const HomeScreen = () => {
  const [timers, setTimers] = useState([]);
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('');
  const [category, setCategory] = useState('Workout');
  const [showModal, setShowModal] = useState(false);
  const [userName, setUserName] = useState('')
  const navigation = useNavigation();

  useEffect(() => {
    const loadTimersAndStartInterval = async () => {
      const savedTimers = await AsyncStorage.getItem('timers');
      if (savedTimers) {
        setTimers(JSON.parse(savedTimers));
      }

      const interval = setInterval(() => {
        setTimers((prevTimers) => prevTimers.map((timer) => {
          if (timer.isRunning && timer.remainingTime > 0) {
            if (!timer.halfwayAlertTriggered && (timer.remainingTime <= timer.duration / 2)) {
              timer.halfwayAlertTriggered = true;
              alert(`The user ${timer.name} has reached 50%.`);
              Toast.show({
                type: 'info',
                position: 'top',
                text1: `Halfway Point Reached!`,
                text2: `The user ${timer.name} has reached 50%!`,
                visibilityTime: 5000,
                autoHide: true,
              });
            }
            return { ...timer, remainingTime: timer.remainingTime - 1 };
          } else if (timer.isRunning && timer.remainingTime === 0) {
            saveCompletedTimer(timer);
            setShowModal(true);
            setUserName(timer.name);
            return { ...timer, isRunning: false, status: 'Completed' };
          }
          return timer;
        }));
      }, 1000);

      return () => clearInterval(interval);
    };

    loadTimersAndStartInterval();
  }, []);

  const saveTimers = async () => {
    await AsyncStorage.setItem('timers', JSON.stringify(timers));
  };

  const saveCompletedTimer = async (completedTimer) => {
    const storedHistory = await AsyncStorage.getItem('timerHistory');
    const history = storedHistory ? JSON.parse(storedHistory) : [];
    history.push({
      id: completedTimer.id,
      name: completedTimer.name,
      category: completedTimer.category,
      completionTime: new Date().toLocaleString(),
    });
    await AsyncStorage.setItem('timerHistory', JSON.stringify(history));
  };

  const addTimer = () => {
    if (!name) {
      alert('Please enter name');
      return;
    } else if (!duration) {
      alert('Please enter duration');
      return;
    } else { }
    const newTimer = {
      id: `${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name,
      duration: parseInt(duration, 10),
      remainingTime: parseInt(duration, 10),
      isRunning: false,
      category,
      halfwayAlertTriggered: false,
      status: 'Active',
    };
    setTimers((prevTimers) => {
      const updatedTimers = [...prevTimers, newTimer];
      saveTimers(updatedTimers);
      return updatedTimers;
    });
    setName('');
    setDuration('');
    setCategory('Workout');
  };

  const toggleTimer = (id, status) => {
    if (status === 'Completed') {
      alert('The user has already completed!')
    } else {
      setTimers((prevTimers) => prevTimers.map((timer) =>
        timer.id === id ? { ...timer, isRunning: !timer.isRunning } : timer
      ));
    }

  };

  const resetTimer = (id) => {
    setTimers((prevTimers) => prevTimers.map((timer) =>
      timer.id === id ? { ...timer, remainingTime: timer.duration, isRunning: false, status: 'Active', halfwayAlertTriggered: false } : timer
    ));
  };

  const closeModal = () => {
    setShowModal(false);
    setUserName('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headertext}>Adding Timer</Text>
      </View>
      <View style={styles.maincontainer}>
        <Text style={styles.title}>Name :</Text>
        <TextInput placeholder="Enter your name..." value={name} onChangeText={(text) => setName(text)} style={styles.input} />
        <Text style={styles.title}>Duration :</Text>
        <TextInput placeholder="Enter duration in sec" keyboardType="numeric" value={duration} onChangeText={(num) => setDuration(num)} style={styles.input} />
        <Text style={styles.title}>Select Category :</Text>
        <View style={styles.pickerstyle}>
          <Picker selectedValue={category} onValueChange={setCategory} >
            <Picker.Item label="Workout" value="Workout" />
            <Picker.Item label="Study" value="Study" />
            <Picker.Item label="Break" value="Break" />
          </Picker>
        </View>

        <FlatList
          data={timers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.timerContainer}>
              <Text style={styles.timerText}>
                {item.name} - {item.remainingTime}s ({item.category}) - {item.status}
              </Text>
              <Progress.Bar progress={item.remainingTime / item.duration} color={'#4ba67a'} style={styles.progressBar} width={320} />
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={() => toggleTimer(item.id, item.status)} >
                  <Text style={styles.buttontext}>{item.isRunning ? "Pause" : "Start"}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => resetTimer(item.id)}  >
                  <Text style={styles.buttontext}>Reset</Text>
                </TouchableOpacity>
              </View>
            </View>

          )}
        />
      </View>

      <View style={styles.buttoncontainer}>
        <TouchableOpacity style={styles.button} onPress={addTimer}>
          <Text style={styles.buttontext}>Add Timer</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('History')}  >
          <Text style={styles.buttontext}>View History</Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={showModal}
        onRequestClose={closeModal}
      >
        <View style={styles.modalview}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>Congratulations!</Text>
            <Text style={styles.modalMessage}>The user {userName} has completed!</Text>
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <Text style={styles.buttontext}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    justifyContent: 'center'
  },
  maincontainer: {
    flex: 1,
    marginHorizontal: 20,
  },
  headertext: {
    color: 'white',
    fontSize: 20,
    alignSelf: 'center',
    paddingVertical: 15,
    fontWeight: 'bold'
  },
  title: {
    fontSize: 15,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    paddingHorizontal: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  pickerstyle: {
    borderBottomWidth: 1,
    borderBottomColor: 'black',
    borderRadius: 10
  },
  timerContainer: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
    backgroundColor: 'white',
    elevation: 5,
  },
  timerText: {
    fontSize: 16,
  },
  progressBar: {
    marginVertical: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',

  },
  buttoncontainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    bottom: 5
  },
  button: {
    backgroundColor: '#5bc290',
    padding: 10,
    borderRadius: 5,
  },
  buttontext: {
    color: 'white',
    fontSize: 15,
    textAlign: 'center',
  },
  modalview: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: 300,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  closeButton: {
    padding: 10,
    backgroundColor: '#4ba67a',
    borderRadius: 5,
  },
});

export default HomeScreen;