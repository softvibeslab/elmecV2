import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  Image,
  Dimensions,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { connect, ConnectedProps } from 'react-redux';
import { RootState } from '../redux/reducers';
import HeaderComponent from '../components/HeaderComponent';

// Props de Redux
const mapStateToProps = (state: RootState) => ({
  isLoggedIn: state.auth.isLoggedIn,
  user: state.auth.user,
  token: state.auth.token,
  theme: state.auth.theme
});

const connector = connect(mapStateToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

interface CalculadoraScreenProps extends PropsFromRedux {
  navigation: any; // Ajusta el tipo de navegación según las necesidades
}
const CalculadoraScreen: React.FC<CalculadoraScreenProps> = ({ navigation, isLoggedIn, user, token, theme }) => {
  const { t } = useTranslation();
  const width = Dimensions.get('window').width;
  const height = Dimensions.get('window').height;

  const handleNavigation = (screenName: string) => {
    navigation.navigate(screenName);
  };

  const buttonStyle: ViewStyle = {
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    margin: 20,
    flex: 1,
    alignItems: 'center',
    alignContent: 'center',
    backgroundColor: theme == 'dark' ? '#061831' : '#FFFFFF',
    justifyContent: 'center',
    padding: 10,
  };

  const textStyle: TextStyle = {
    color: '#2C328A',
    fontSize: height * 0.025,
    fontFamily: 'TitilliumWeb-Bold',
    textAlign: 'center',
  };

  const renderHeaderRightButton = () => {
    return (
      <TouchableOpacity onPress={() => navigation.navigate('SettingsCalculadora')}>
        <Text style={{ color: '#ffffff', fontSize: 16, marginRight: 10 }}>Configuración</Text>
      </TouchableOpacity>
    );
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => renderHeaderRightButton(),
      headerStyle: {
        backgroundColor: theme == 'dark' ? '#FFFFFF' : '#061831', // Set the background color of the navigation bar here
      },
      headerTintColor: theme == 'dark' ? '#000000' : '#FFFFFF', // Set the color of the header text and icons if needed
    });
  }, [navigation]);


  return (
    <View style={{ height: '100%', backgroundColor: theme == 'dark' ? '#061831' : '#FFFFFF', flexDirection: 'column', alignContent: 'center' }}>
      <HeaderComponent theme={theme} showBackButton={true} showSecondButton={true} onSecondButtonPress={() => navigation.navigate('SettingsCalculadora')} icon={require('../assets/img/settings.png')} />
      <TouchableOpacity
        style={[buttonStyle, { flex: 1, marginStart: '25%', marginEnd: '25%' }]}
        onPress={() => handleNavigation('Barrenado')}>
        <LinearGradient colors={['#FFFFFF', '#DDDDDD']} style={buttonStyle}>
          <View style={{ flex: 1 }} />
          <View style={{ flex: 3, alignContent: 'center' }}>
            <Image
              style={{ flex: 2, width: '100%', height: undefined, aspectRatio: 1, tintColor: '#2C328A' }}
              resizeMode='cover'
              source={require('../assets/img/drilling_icon.png')}
            />
            <Text style={[textStyle, { flex: 1 }]}>{t('home:barrenado')}</Text>
          </View>
          <View style={{ flex: 1 }} />
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity
        style={[buttonStyle, { flex: 1, marginStart: '25%', marginEnd: '25%' }]}
        onPress={() => handleNavigation('Fresado')}>
        <LinearGradient colors={['#FFFFFF', '#DDDDDD']} style={buttonStyle}>
          <View style={{ flex: 1 }} />
          <View style={{ flex: 3, alignContent: 'center' }}>
            <Image
              style={{ flex: 2, width: '100%', height: undefined, aspectRatio: 1, tintColor: '#2C328A'  }}
              resizeMode='cover'
              source={require('../assets/img/milling_icon.png')}
            />
            <Text style={[textStyle, { flex: 1 }]}>{t('home:fresado')}</Text>
          </View>
          <View style={{ flex: 1 }} />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

export default connector(CalculadoraScreen);
