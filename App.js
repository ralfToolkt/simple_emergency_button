import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, SafeAreaView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import * as Location from 'expo-location';
import { Input } from 'native-base'
import axios from 'axios'

export default function App() {
  const [getLocation, setGetLocation] = useState(false)
  const [address, setAddress] = useState("loading...");
  const [longitude, setLongitude] = useState();
  const [latitude, setLatitude] = useState();
  const [intervalSending, setIntervalSending] = useState()
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('')
  const [district, setDistrict] = useState('')
  const [isoCountryCode, setIsoCountryCode] = useState('')
  const [name, setName] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [region, setRegion] = useState('')
  const [street, setStreet] = useState('')
  const [odooUrl, setOdooUrl] = useState('http://192.168.10.100:1369')
  const [location, setLocation] = useState(null);
  const [username, setUsername] = useState('admin')

  useEffect(() => {
    function setPosition({ coords: { latitude, longitude } }) {
      setLongitude(longitude);
      setLatitude(latitude);
    }

    navigator.geolocation.getCurrentPosition(setPosition);

    let watcher = navigator.geolocation.watchPosition(
      setPosition,
      err => console.error(err),
      { enableHighAccuracy: true }
    );

    return () => {
      navigator.geolocation.clearWatch(watcher);      
    };
  }, []);

  useEffect(() => {
    if(getLocation){
      getPosition()
      setIntervalSending(setInterval(() => getPosition(), 5000))
    }
    else { clearInterval(intervalSending) }
  }, [getLocation])

  function getPosition() {
    console.log('get position');
    (async () => {
      // Location.setGoogleApiKey(GOOGLEAPI) 
      await Location.getCurrentPositionAsync({})
        .then(async res => {
          setLocation(res)
          await Location.reverseGeocodeAsync({ latitude: res.coords.latitude, longitude: res.coords.longitude }).then(async res => {
            setCity(res[0].city)
            setCountry(res[0].country)
            setDistrict(res[0].district)
            setIsoCountryCode(res[0].isoCountryCode)
            setName(res[0].name)
            setPostalCode(res[0].postalCode)
            setRegion(res[0].region)
            setStreet(res[0].street)

            // const url = 'http://139.162.9.124:1369'
            let bodyFormData = new FormData();
            bodyFormData.append("city", city || '')
            bodyFormData.append("country", country || '')
            bodyFormData.append("district", district || '')
            bodyFormData.append("isoCountryCode", isoCountryCode || '')
            bodyFormData.append("name", name || '')
            bodyFormData.append("postalCode", postalCode || '')
            bodyFormData.append("region", region || '')
            bodyFormData.append("street", street || '')
            bodyFormData.append("longitude", location.coords.longitude)
            bodyFormData.append("latitude", location.coords.latitude)
            bodyFormData.append("username", username)
            await axios({
              method: 'post',
              url: `${odooUrl}/api/location/username`,
              data: bodyFormData,
              headers: { 'Content-Type': 'multipart/form-data' }
            })
              .catch(e => Alert.alert('Cant Detect Url network', 'Please to check spelling'))
          })
        }
        )
        .catch(e => Alert.alert('Cant Detect Location', 'Please Try Again (Off then On)'))
    })()
  }

  return (
    <SafeAreaView style={styles.container}>
        {/* <Text style={styles.label}>Address: {address}</Text> */}
        {/* <Text style={styles.label}>Latitude: {latitude}</Text>
        <Text style={styles.label}>Longitude: {longitude}</Text> */}
        <TextInput 
         value={odooUrl}
         onChangeText={ txt => setOdooUrl(txt)}
         
         />
        <TextInput 
         value={username}
        onChangeText={txt => setOdooUrl(setUsername)}
         
         />
      {/* <Text style={styles.label}>{text}</Text> */}
      <TouchableOpacity style={{
        height: 250,
        width: 250,
        borderRadius: 250 / 2,
        color: 'red',
        borderColor: 'black',
        backgroundColor: getLocation ? 'green' : 'red',
      }}
        onPress={() => {
          setGetLocation(!getLocation)
        }}
      >

      </TouchableOpacity>
      {/* <Text style={styles.title} > {getLocation ? 'PRESS TO STOP SENDING' : 'PRESS FOR EMERGENCY'} </Text> */}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 24,
    marginTop: 15,
    marginLeft: 'auto',
    marginRight: 'auto',
    marginBottom: 0,
    alignContent: 'center',
    width: 300
  }
});
