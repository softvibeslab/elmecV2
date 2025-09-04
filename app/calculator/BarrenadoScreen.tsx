import React, { useState, useEffect, useRef } from 'react';
import {
  ScrollView,
  Text,
  View,
  Pressable,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { ChevronUp, ChevronDown, RotateCcw } from 'lucide-react-native';
import HeaderComponent from '@/components/HeaderComponent';
import * as Constants from '@/constants/calculator';

export default function BarrenadoScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { width, height } = Dimensions.get('window');
  
  const [showLoading, setShowLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [medidas, setMedidaCode] = useState(Constants.medida_mt);
  const [velocidadcode, setVelocidadCode] = useState('n');
  
  const [editable, setEditable] = useState(0);
  const [editable_s, setEditableS] = useState(0);
  const [punto, setPunto] = useState(0);
  const [bPunto, setBPunto] = useState(false);
  const [scrollHeight, setScrollHeight] = useState('100%');
  const [keyboardHeight, setKeyboardHeight] = useState('0%');
  const [scrolly, setScrollY] = useState(0);
  const [scrollH, setScrollH] = useState(0);
  const [textH, setTextH] = useState(0);
  const [lock, setLock] = useState(3);
  const [lockEnable, setLockEnable] = useState(true);
  
  // Estados para los valores
  const [textD, setTextD] = useState('0');
  const [textZ, setTextZ] = useState('0');
  const [textN, setTextN] = useState('0');
  const [textVc, setTextVc] = useState('0');
  const [textfz, setTextfz] = useState('0');
  const [textfn, setTextfn] = useState('0');
  const [textvf, setTextvf] = useState('0');
  const [textpb, setTextpb] = useState('0');
  const [textnb, setTextnb] = useState('0');
  const [texttc, setTexttc] = useState('0');
  const [textQ, setTextQ] = useState('0');
  const [textoCa, setTextoCa] = useState('CA');
  const [dataSourceCords, setDataSourceCords] = useState<{[key: string]: number}>({});
  const [ref, setRef] = useState<ScrollView | null>(null);

  useEffect(() => {
    readData();
  }, []);

  const readData = async () => {
    setShowLoading(true);
    setLoadingMessage('Cargando');
    
    try {
      const keys = [
        'user-velocidad', 'user-medida', 'barrenado-d', 'barrenado-z', 'barrenado-n',
        'barrenado-vc', 'barrenado-fz', 'barrenado-fn', 'barrenado-vf',
        'barrenado-pb', 'barrenado-nb', 'barrenado-tc', 'barrenado-q'
      ];
      
      const values = await AsyncStorage.multiGet(keys);
      
      values.forEach(([key, value]) => {
        switch (key) {
          case 'user-medida':
            if (value === 'mt') {
              setMedidaCode(Constants.medida_mt);
            } else {
              setMedidaCode(Constants.medida_imp);
            }
            break;
          case 'user-velocidad':
            const vel = value || 'n';
            setVelocidadCode(vel);
            setLock(vel === 'n' ? 3 : 7);
            break;
          case 'barrenado-d':
            setTextD(value || '0');
            break;
          case 'barrenado-z':
            setTextZ(value || '0');
            break;
          case 'barrenado-n':
            setTextN(value || '0');
            break;
          case 'barrenado-vc':
            setTextVc(value || '0');
            break;
          case 'barrenado-fz':
            setTextfz(value || '0');
            break;
          case 'barrenado-fn':
            setTextfn(value || '0');
            break;
          case 'barrenado-vf':
            setTextvf(value || '0');
            break;
          case 'barrenado-pb':
            setTextpb(value || '0');
            break;
          case 'barrenado-nb':
            setTextnb(value || '0');
            break;
          case 'barrenado-tc':
            setTexttc(value || '0');
            break;
          case 'barrenado-q':
            setTextQ(value || '0');
            break;
        }
      });
    } catch (error) {
      console.error('Error reading data:', error);
    } finally {
      setTimeout(() => {
        setShowLoading(false);
      }, 500);
    }
  };

  const validarNumero = (numero: number, decimales: number): string => {
    if (numero === 0 || isNaN(numero) || !isFinite(numero)) {
      return '0';
    }
    return numero.toFixed(decimales).toString();
  };

  const calcN = (D: number, vc: number): number => {
    const n = (vc * 1000.0) / (Math.PI * D);
    const n_t = validarNumero(n, 0);
    AsyncStorage.setItem('barrenado-n', n_t);
    setTextN(n_t);
    return n;
  };

  const calcN2 = (vf: number, fn: number): number => {
    const n = vf / fn;
    const n_t = validarNumero(n, 0);
    AsyncStorage.setItem('barrenado-n', n_t);
    setTextN(n_t);
    return n;
  };

  const calcVc = (D: number, n: number): number => {
    const Vc = (Math.PI * D * n) / 1000;
    const vc_t = validarNumero(Vc, 0);
    AsyncStorage.setItem('barrenado-vc', vc_t);
    setTextVc(vc_t);
    return Vc;
  };

  const calcfz = (fn: number, z: number): number => {
    const fz = fn / z;
    const fz_t = validarNumero(fz, 2);
    AsyncStorage.setItem('barrenado-fz', fz_t);
    setTextfz(fz_t);
    return fz;
  };

  const calcfn1 = (vf: number, n: number): number => {
    const fn = vf / n;
    const fn_t = validarNumero(fn, 2);
    AsyncStorage.setItem('barrenado-fn', fn_t);
    setTextfn(fn_t);
    return fn;
  };

  const calcfn2 = (fz: number, z: number): number => {
    const fn = fz * z;
    const fn_t = validarNumero(fn, 2);
    AsyncStorage.setItem('barrenado-fn', fn_t);
    setTextfn(fn_t);
    return fn;
  };

  const calcvf = (fn: number, n: number): number => {
    const vf = fn * n;
    const vf_t = validarNumero(vf, 0);
    AsyncStorage.setItem('barrenado-vf', vf_t);
    setTextvf(vf_t);
    return vf;
  };

  const calctc = (pb: number, vf: number, nb: number): void => {
    const r = ((pb * 60) / vf) * nb;
    const tc = validarNumero(r, 2);
    AsyncStorage.setItem('barrenado-tc', tc);
    setTexttc(tc);
  };

  const calcQ = (D: number, vf: number): void => {
    const r = ((Math.PI * D * D) / 4 * vf) / 1000;
    const q = validarNumero(r, 2);
    AsyncStorage.setItem('barrenado-q', q);
    setTextQ(q);
  };

  const getTexto = (opcion: number): string => {
    switch (opcion) {
      case 1: return textD;
      case 2: return textZ;
      case 3: return textN;
      case 4: return textVc;
      case 5: return textfz;
      case 6: return textfn;
      case 7: return textvf;
      case 8: return textpb;
      case 9: return textnb;
      default: return '0';
    }
  };

  const textClick = (opcion: number | null, direccion: number) => {
    if (opcion !== null) {
      let opcion_e = opcion + direccion;
      if (opcion_e > 9) opcion_e = 9;
      else if (opcion_e === 0) opcion_e = 1;

      setBPunto([2, 3, 4, 7, 9].includes(opcion_e));
      setLockEnable(![3, 7].includes(opcion_e));

      const textoCampo = getTexto(opcion_e);
      setTextoCa(parseFloat(textoCampo) === 0 || isNaN(parseFloat(textoCampo)) ? 'CA' : 'C');
      setEditable(opcion_e);
      setPunto(0);
      
      if (direccion !== 0 && opcion_e === opcion) {
        opcion_e = editable_s + direccion;
      }
      if (opcion_e > 11) opcion_e = 11;
      setEditableS(opcion_e);

      setScrollHeight('70%');
      setKeyboardHeight('30%');

      setTimeout(() => {
        if (ref && opcion_e >= 1) {
          const targetY = dataSourceCords[opcion_e.toString()];
          if (targetY !== undefined) {
            if (targetY < scrolly) {
              ref.scrollTo({ x: 0, y: targetY, animated: true });
            } else if ((targetY + textH) > (scrolly + scrollH)) {
              ref.scrollTo({ x: 0, y: (targetY + textH) - scrollH, animated: true });
            }
          }
        }
      }, 50);
    } else {
      setEditable(0);
      setPunto(0);
      setScrollHeight('100%');
      setKeyboardHeight('0%');
    }
  };

  const editarCampo = (boton: string) => {
    let textoCampo = getTexto(editable);

    switch (boton) {
      case '1': case '2': case '3': case '4': case '5':
      case '6': case '7': case '8': case '9': case '0':
        if (textoCampo === '0' || isNaN(parseFloat(textoCampo)) || !isFinite(parseFloat(textoCampo))) {
          textoCampo = '';
        }
        
        if (editable === punto) {
          if (parseFloat(textoCampo) === 0 || isNaN(parseFloat(textoCampo)) || !isFinite(parseFloat(textoCampo))) {
            textoCampo = '0';
          }
          if (!textoCampo.includes('.')) {
            textoCampo += '.';
          }
          setPunto(0);
        }
        textoCampo += boton;
        break;
        
      case 'C':
        if (parseFloat(textoCampo) === 0 || isNaN(parseFloat(textoCampo))) {
          // Limpiar todos los campos
          const clearValues = {
            'barrenado-d': '0', 'barrenado-z': '0', 'barrenado-n': '0',
            'barrenado-vc': '0', 'barrenado-fz': '0', 'barrenado-fn': '0',
            'barrenado-vf': '0', 'barrenado-pb': '0', 'barrenado-nb': '0',
            'barrenado-tc': '0', 'barrenado-q': '0'
          };
          
          AsyncStorage.multiSet(Object.entries(clearValues));
          
          setTextD('0'); setTextZ('0'); setTextN('0'); setTextVc('0');
          setTextfz('0'); setTextfn('0'); setTextvf('0'); setTextpb('0');
          setTextnb('0'); setTexttc('0'); setTextQ('0');
        } else {
          textoCampo = '0';
        }
        break;
        
      case '.':
        setPunto(editable);
        if (!textoCampo.includes('.')) {
          textoCampo += '.';
        }
        break;
        
      case 'S':
        textClick(editable, -1);
        return;
      case 'B':
        textClick(editable, 1);
        return;
      case 'L':
        setLock(editable);
        return;
    }

    setTextoCa(parseFloat(textoCampo) === 0 || isNaN(parseFloat(textoCampo)) ? 'CA' : 'C');

    // Actualizar el campo correspondiente y realizar cálculos
    switch (editable) {
      case 1:
        setTextD(textoCampo);
        AsyncStorage.setItem('barrenado-d', textoCampo);
        updateCalculations(1, parseFloat(textoCampo));
        break;
      case 2:
        setTextZ(textoCampo);
        AsyncStorage.setItem('barrenado-z', textoCampo);
        updateCalculations(2, parseFloat(textoCampo));
        break;
      case 3:
        setTextN(textoCampo);
        AsyncStorage.setItem('barrenado-n', textoCampo);
        updateCalculations(3, parseFloat(textoCampo));
        break;
      case 4:
        setTextVc(textoCampo);
        AsyncStorage.setItem('barrenado-vc', textoCampo);
        updateCalculations(4, parseFloat(textoCampo));
        break;
      case 5:
        setTextfz(textoCampo);
        AsyncStorage.setItem('barrenado-fz', textoCampo);
        updateCalculations(5, parseFloat(textoCampo));
        break;
      case 6:
        setTextfn(textoCampo);
        AsyncStorage.setItem('barrenado-fn', textoCampo);
        updateCalculations(6, parseFloat(textoCampo));
        break;
      case 7:
        setTextvf(textoCampo);
        AsyncStorage.setItem('barrenado-vf', textoCampo);
        updateCalculations(7, parseFloat(textoCampo));
        break;
      case 8:
        setTextpb(textoCampo);
        AsyncStorage.setItem('barrenado-pb', textoCampo);
        updateCalculations(8, parseFloat(textoCampo));
        break;
      case 9:
        setTextnb(textoCampo);
        AsyncStorage.setItem('barrenado-nb', textoCampo);
        updateCalculations(9, parseFloat(textoCampo));
        break;
    }
  };

  const updateCalculations = (field: number, value: number) => {
    const D = field === 1 ? value : parseFloat(textD);
    const z = field === 2 ? value : parseFloat(textZ);
    const n = field === 3 ? value : parseFloat(textN);
    const Vc = field === 4 ? value : parseFloat(textVc);
    const fz = field === 5 ? value : parseFloat(textfz);
    const fn = field === 6 ? value : parseFloat(textfn);
    const vf = field === 7 ? value : parseFloat(textvf);
    const pb = field === 8 ? value : parseFloat(textpb);
    const nb = field === 9 ? value : parseFloat(textnb);

    // Realizar cálculos según el campo modificado
    switch (field) {
      case 1: // Diámetro
        if (lock === 3) {
          calcVc(D, n);
          calcvf(fn, n);
        } else {
          if (velocidadcode === 'n') {
            calcN2(vf, fn);
          } else {
            calcN(D, Vc);
          }
          calcVc(D, parseFloat(textN));
        }
        calctc(pb, parseFloat(textvf), nb);
        calcQ(D, parseFloat(textvf));
        break;
        
      case 2: // Número de filos
        if (lock === 7) {
          if (velocidadcode === 'n') {
            calcfn2(fz, z);
          } else {
            calcfn1(vf, n);
          }
        } else {
          calcfn2(fz, z);
          calcvf(parseFloat(textfn), n);
        }
        calcfz(parseFloat(textfn), z);
        calctc(pb, parseFloat(textvf), nb);
        calcQ(D, parseFloat(textvf));
        break;
        
      // Agregar más casos según sea necesario
    }
  };

  const renderInputField = (
    label: string,
    value: string,
    unit: string,
    fieldNumber: number,
    containerStyle: any
  ) => (
    <View
      style={styles.viewRow}
      onLayout={(event) => {
        if (fieldNumber === 1) {
          setTextH(event.nativeEvent.layout.height);
        }
        const layout = event.nativeEvent.layout;
        setDataSourceCords(prev => ({ ...prev, [fieldNumber.toString()]: layout.y }));
      }}
    >
      <Text style={styles.labelRow}>{label}</Text>
      <View style={[containerStyle, editable === fieldNumber && styles.inputContainerSelected]}>
        <TouchableOpacity style={styles.textInputStyle} onPress={() => textClick(fieldNumber, 0)}>
          <Text style={styles.labelInputText}>{value}</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.labelMedRow}>{unit}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <HeaderComponent 
        title="Barrenado"
        showBackButton={true}
        showSecondButton={true}
        onSecondButtonPress={() => router.push('/calculator/SettingsCalculadora' as any)}
      />

      <Modal transparent={true} animationType="none" visible={showLoading}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ActivityIndicator animating={showLoading} color={'black'} size="large"/>
            <Text style={styles.modalText}>{loadingMessage}</Text>
          </View>
        </View>
      </Modal>

      <View style={styles.mainContainer}>
        {/* Teclado numérico */}
        <View style={[styles.keyboardContainer, { height: keyboardHeight }]}>
          <View style={styles.numbersGrid}>
            {[
              ['1', '2', '3'],
              ['4', '5', '6'],
              ['7', '8', '9'],
              [textoCa, '0', '.']
            ].map((row, rowIndex) => (
              <View key={rowIndex} style={styles.buttonRow}>
                {row.map((button, buttonIndex) => (
                  <TouchableOpacity
                    key={buttonIndex}
                    style={[
                      styles.calcButton,
                      button === textoCa && styles.clearButton,
                      button === '.' && bPunto && styles.disabledButton
                    ]}
                    onPress={() => editarCampo(button)}
                    disabled={button === '.' && bPunto}
                  >
                    <LinearGradient
                      colors={button === textoCa ? [Constants.colores.iconColor, Constants.colores.textColor] : ['#ffffff', '#dddddd']}
                      style={styles.buttonGradient}
                    >
                      <Text style={[styles.calcText, button === textoCa && styles.clearButtonText]}>
                        {button}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
          
          <View style={styles.arrowButtons}>
            <TouchableOpacity style={styles.arrowButton} onPress={() => editarCampo('S')}>
              <LinearGradient colors={[Constants.colores.iconColor, Constants.colores.textColor]} style={styles.buttonGradient}>
                <ChevronUp size={24} color="#ffffff" />
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={styles.arrowButton} onPress={() => editarCampo('B')}>
              <LinearGradient colors={[Constants.colores.iconColor, Constants.colores.textColor]} style={styles.buttonGradient}>
                <ChevronDown size={24} color="#ffffff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Campos de entrada */}
        <ScrollView
          ref={setRef}
          onScroll={(event) => setScrollY(event.nativeEvent.contentOffset.y)}
          style={[styles.scrollContainer, { height: scrollHeight }]}
          showsVerticalScrollIndicator={false}
        >
          <Pressable onPress={() => textClick(null, 0)}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>ELMEC</Text>
            </View>

            {renderInputField(t('barrenado:d'), textD, medidas.mm, 1, styles.inputContainerIngresan)}
            {renderInputField(t('barrenado:z'), textZ, '', 2, styles.inputContainerIngresan)}
            {renderInputField(t('barrenado:n'), textN, medidas.rpm, 3, styles.inputContainerAmbos)}
            {renderInputField(t('barrenado:vc'), textVc, medidas.mmin, 4, styles.inputContainerAmbos)}
            {renderInputField(t('barrenado:fz'), textfz, medidas.mm, 5, styles.inputContainerAmbos)}
            {renderInputField(t('barrenado:fn'), textfn, medidas.mmrev, 6, styles.inputContainerAmbos)}
            {renderInputField(t('barrenado:vf'), textvf, medidas.mmmin, 7, styles.inputContainerAmbos)}
            {renderInputField(t('barrenado:pb'), textpb, medidas.mm, 8, styles.inputContainerIngresan)}
            {renderInputField(t('barrenado:nb'), textnb, '', 9, styles.inputContainerIngresan)}
            
            {/* Campos de solo lectura */}
            <View style={styles.viewRow}>
              <Text style={styles.labelRow}>{t('barrenado:tc')}</Text>
              <View style={styles.inputContainerMuestran}>
                <Text style={styles.labelInputText}>{texttc}</Text>
              </View>
              <Text style={styles.labelMedRow}>s</Text>
            </View>

            <View style={styles.viewRow}>
              <Text style={styles.labelRow}>{t('barrenado:q')}</Text>
              <View style={styles.inputContainerMuestran}>
                <Text style={styles.labelInputText}>{textQ}</Text>
              </View>
              <Text style={styles.labelMedRow}>{medidas.cm3min}</Text>
            </View>
          </Pressable>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  mainContainer: {
    flex: 1,
    flexDirection: 'column-reverse',
  },
  keyboardContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  numbersGrid: {
    flex: 8,
    padding: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    flex: 1,
    gap: 8,
  },
  calcButton: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  clearButton: {
    // Estilo especial para el botón clear
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  calcText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#374151',
  },
  clearButtonText: {
    color: '#ffffff',
  },
  arrowButtons: {
    flex: 3,
    padding: 8,
    gap: 8,
  },
  arrowButton: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  scrollContainer: {
    backgroundColor: '#ffffff',
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 20,
    padding: 20,
    backgroundColor: '#1e40af',
    borderRadius: 12,
  },
  logoText: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
  viewRow: {
    marginHorizontal: 15,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  labelRow: {
    flex: 3,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    textAlign: 'right',
    marginRight: 12,
  },
  inputContainerSelected: {
    margin: 5,
    flex: 3,
    borderWidth: 2,
    borderRadius: 12,
    borderColor: '#10b981',
    backgroundColor: '#ecfdf5',
  },
  inputContainerIngresan: {
    margin: 5,
    flex: 3,
    borderWidth: 2,
    borderRadius: 12,
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  inputContainerAmbos: {
    margin: 5,
    flex: 3,
    borderWidth: 2,
    borderRadius: 12,
    borderColor: '#6366f1',
    backgroundColor: '#eef2ff',
  },
  inputContainerMuestran: {
    margin: 5,
    flex: 3,
    borderWidth: 2,
    borderRadius: 12,
    borderColor: '#d1d5db',
    backgroundColor: '#f9fafb',
  },
  textInputStyle: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  labelInputText: {
    color: '#111827',
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
  },
  labelMedRow: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
  },
  modalOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalContent: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    alignItems: 'center',
    gap: 12,
  },
  modalText: {
    color: 'black',
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
});