import React, { useState } from 'react';
import { ScrollView, Text, Pressable, StyleSheet, View, TouchableOpacity, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import CheckBox from '@react-native-community/checkbox';
import { connect, ConnectedProps } from 'react-redux';
import { RootState } from '../redux/reducers';
import HeaderComponent from '../components/HeaderComponent';

// Definición de unidades de medida
const MEDIDAS = [
  { code: 'mt', label: 'Métrico' },
  { code: 'im', label: 'Imperial' }
];

// Definición de opciones de velocidad
const VELOCIDAD = [
  { code: 'n', label: 'Normal' },
  { code: 'fn', label: 'Fast' }
];

// Props de Redux
const mapStateToProps = (state: RootState) => ({
  isLoggedIn: state.auth.isLoggedIn,
  user: state.auth.user,
  token: state.auth.token,
  theme: state.auth.theme
});
const connector = connect(mapStateToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

interface SettingsCalculadoraScreenProps extends PropsFromRedux {
  navigation: any;
}

const SettingsCalculadoraScreen: React.FC<SettingsCalculadoraScreenProps> = ({ navigation, theme, dispatch }) => {
  const { t } = useTranslation();
  const styles = dynamicStyles(theme);
  const [selectedMedidaCode, setMedidaCode] = useState("mt");
  const [selectedVelocidadCode, setVelocidadCode] = useState("n");

  // Función para cambiar la unidad de medida
  const setMedida = (code: string) => {
    setMedidaCode(code);
    AsyncStorage.setItem('user-medida', code);
  };

  // Función para cambiar la velocidad
  const setVelocidad = (code: string) => {
    setVelocidadCode(code);
    AsyncStorage.setItem('user-velocidad', code);
  };

  return (
    <View style={styles.container}>
      <HeaderComponent theme={theme} showBackButton={true} />
      <ScrollView style={{ paddingHorizontal: 20 }}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Settings')}>
          <Image source={require('../assets/img/settings.png')} tintColor={theme == 'dark' ? '#4AA3D3' : '#0B6EFE'} style={styles.buttonIcon} />
          <Text style={{ ...styles.buttonText, fontSize: 25 }}>{t('settings:ajustes')}</Text>
        </TouchableOpacity>

        {/* Configuración de unidad de medida */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>{t('settings:medida')}:</Text>
          {MEDIDAS.map(medida => (
            <Pressable
              key={medida.code}
              style={{ ...styles.buttonContainer, flexDirection: 'row' }}
              onPress={() => setMedida(medida.code)}
            >
              <Text style={{ ...styles.buttonText, flex: 0.9 }}>{medida.label}</Text>
              <CheckBox
                value={selectedMedidaCode === medida.code}
                onValueChange={() => setMedida(medida.code)}
                tintColors={{ true: '#ffffff', false: '#ffffff' }}
                style={{ flex: 0.1 }}
              />
            </Pressable>
          ))}
        </View>

        {/* Configuración de velocidad */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>{t('settings:velocidad')}:</Text>
          {VELOCIDAD.map(velocidad => (
            <Pressable
              key={velocidad.code}
              style={{ ...styles.buttonContainer, flexDirection: 'row' }}
              onPress={() => setVelocidad(velocidad.code)}
            >
              <Text style={{ ...styles.buttonText, flex: 0.9 }}>{velocidad.label}</Text>
              <CheckBox
                value={selectedVelocidadCode === velocidad.code}
                onValueChange={() => setVelocidad(velocidad.code)}
                tintColors={{ true: '#ffffff', false: '#ffffff' }}
                style={{ flex: 0.1 }}
              />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const dynamicStyles = (theme: string | null) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme == 'dark' ? '#061831' : '#FFFFFF',
  },
  sectionContainer: {
    marginVertical: 10
  },
  gradient: {
    flexDirection: 'column',
    borderRadius: 10,
    padding: 10
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: theme == 'dark' ? '#4AA3D3' : '#0B6EFE'
  },
  buttonContainer: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 5
  },
  buttonText: {
    fontSize: 18,
    color: theme == 'dark' ? 'white' : 'black'
  },
  button: {
    flexDirection: 'row',
    borderRadius: 10,
    width: '90%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 20,
  },
  buttonIcon: {
    width: 30, // Ajusta el ancho del icono según tus necesidades
    height: 30, // Ajusta la altura del icono según tus necesidades
    marginRight: 10,
    resizeMode: 'contain',
  },
  pickerIOS: {
    height: 50, // Ajusta la altura según sea necesario
    width: '100%', // Ajusta el ancho según sea necesario
    backgroundColor: '#FFFFFF', // Color de fondo del Picker en iOS
    borderRadius: 10, // Borde redondeado en iOS
    marginTop: 5, // Espacio superior adicional para separarlo visualmente
  },
  pickerAndroid: {
    // Estilos específicos para Android si es necesario
    height: 50, // Ajusta la altura según sea necesario
    width: '100%', // Ajusta el ancho según sea necesario
    backgroundColor: '#FFFFFF', // Color de fondo del Picker en Android
    borderRadius: 10, // Borde redondeado en Android
    marginTop: 5, // Espacio superior adicional para separarlo visualmente
  },
  pickerItemIOS: {
    fontSize: 18, // Tamaño del texto de los elementos del Picker en iOS
    color: '#000000', // Color del texto de los elementos del Picker en iOS
  },
  pickerItemAndroid: {
    // Estilos específicos para los elementos del Picker en Android
    fontSize: 18, // Tamaño del texto de los elementos del Picker en Android
    color: '#000000', // Color del texto de los elementos del Picker en Android
  },
});

export default connector(SettingsCalculadoraScreen);
