import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import * as Location from 'expo-location';
import axios from 'axios';

const App = () => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const GPSdevice_id = '84fc3092-baab-4cb1-93c8-240f28489b67'; 
  const API_ENDPOINT = 'http://147.182.229.215:8080/update_location/' + GPSdevice_id;  

  const sendLocationDataToServer = async (latitude, longitude, timestamp) => {
    try {
      await axios.post(API_ENDPOINT, {
        latitude,
        longitude,
        timestamp,
      });
      console.log('Location data sent successfully.');
    } catch (error) {
      console.error('Error sending location data:', error.message);
    }
  };

  const formatTimestamp = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  useEffect(() => {
    (async () => {
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({});
      setLocation(location);

      // Send initial location to server
      sendLocationDataToServer(
        location.coords.latitude,
        location.coords.longitude,
        formatTimestamp(new Date())
      );

      // Subscribe to location updates
      const locationSubscription = await Location.watchPositionAsync(
        {
          timeInterval: 1, // Update every 5 seconds
          distanceInterval: 0, // Update every 5 meters
        },
        (newLocation) => {
          setLocation(newLocation);
          sendLocationDataToServer(
            newLocation.coords.latitude,
            newLocation.coords.longitude,
            formatTimestamp(new Date())
          );
        }
      );

      return () => {
        if (locationSubscription) {
          locationSubscription.remove();
        }
      };
    })();
  }, []); // Empty dependency array ensures this effect runs once when the component mounts

  return (
    <View style={styles.container}>
      <Image
        source={require('./assets/images/location1.png')}  // Replace with the actual path or URL of your icon
        style={styles.icon}
      />
      <Text style={styles.text}>VanGo Location</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontSize: 25,
    marginBottom: 20, 
    fontWeight: '700' ,
  },
  icon: {
    width: 200,  
    height: 200, 
    marginBottom: 100,
  },
});

export default App;
