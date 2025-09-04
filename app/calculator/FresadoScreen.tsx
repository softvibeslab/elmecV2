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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { ChevronUp, ChevronDown, ArrowLeft, Settings } from 'lucide-react-native';

export default function FresadoScreen() {
  const router = useRouter();
  const { width, height } = Dimensions.get('window');
  
  const [showLoading, setShowLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [medidas, setMedidaCode] = useState({
    mm: 'mm',
    mmin: 'm/min',
    mmrev: 'mm/rev',
    mmmin: 'mm/min',
    rpm: 'rpm',
    cm3min: 'cm³/min'
  });
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
  
  // Estados para los valores del fresado
  const [textD, setTextD] = useState('0');
  const [textZ, setTextZ] = useState('0');
  const [textN, setTextN] = useState('0');
  const [textVc, setTextVc] = useState('0');
  const [textfz, setTextfz] = useState('0');
  const [textfn, setTextfn] = useState('0');
  const [textvf, setTextvf] = useState('0');
  const [texttc, setTexttc] = useState('0');
  const [textQ, setTextQ] = useState('0');
  const [textap, setTextap] = useState('0');
  const [textae, setTextae] = useState('0');
  const [textnp, setTextnp] = useState('0');
  const [textlm, setTextlm] = useState('0');
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
        'user-velocidad', 'user-medida', 'fresado-d', 'fresado-z', 'fresado-n',
        'fresado-vc', 'fresado-fz', 'fresado-fn', 'fresado-vf', 'fresado-tc',
        'fresado-q', 'fresado-ap', 'fresado-ae', 'fresado-np', 'fresado-lm', 'fresado-ca'
      ];
      
      const values = await AsyncStorage.multiGet(keys);
      
      values.forEach(([key, value]) => {
        switch (key) {
          case 'user-medida':
            if (value === 'mt') {
              setMedidaCode({
                mm: 'mm',
                mmin: 'm/min',
                mmrev: 'mm/rev',
                mmmin: 'mm/min',
                rpm: 'rpm',
                cm3min: 'cm³/min'
              });
            } else {
              setMedidaCode({
                mm: 'in',
                mmin: 'ft/min',
                mmrev: 'in/rev',
                mmmin: 'in/min',
                rpm: 'rpm',
                cm3min: 'in³/min'
              });
            }
            break;
          case 'user-velocidad':
            const vel = value || 'n';
            setVelocidadCode(vel);
            setLock(vel === 'n' ? 3 : 7);
            break;
          case 'fresado-d': setTextD(value || '0'); break;
          case 'fresado-z': setTextZ(value || '0'); break;
          case 'fresado-n': setTextN(value || '0'); break;
          case 'fresado-vc': setTextVc(value || '0'); break;
          case 'fresado-fz': setTextfz(value || '0'); break;
          case 'fresado-fn': setTextfn(value || '0'); break;
          case 'fresado-vf': setTextvf(value || '0'); break;
          case 'fresado-tc': setTexttc(value || '0'); break;
          case 'fresado-q': setTextQ(value || '0'); break;
          case 'fresado-ap': setTextap(value || '0'); break;
          case 'fresado-ae': setTextae(value || '0'); break;
          case 'fresado-np': setTextnp(value || '0'); break;
          case 'fresado-lm': setTextlm(value || '0'); break;
          case 'fresado-ca': setTextoCa(value || 'CA'); break;
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

  const calcN = (D: number, Vc: number): number => {
    const n = (Vc * 1000.0) / (Math.PI * D);
    const n_t = validarNumero(n, 0);
    AsyncStorage.setItem('fresado-n', n_t);
    setTextN(n_t);
    return n;
  };

  const calcN2 = (vf: number, fn: number): number => {
    const n = vf / fn;
    const n_t = validarNumero(n, 0);
    AsyncStorage.setItem('fresado-n', n_t);
    setTextN(n_t);
    return n;
  };

  const calcVc = (D: number, n: number): number => {
    const Vc = (Math.PI * D * n) / 1000;
    const vc_t = validarNumero(Vc, 0);
    AsyncStorage.setItem('fresado-vc', vc_t);
    setTextVc(vc_t);
    return Vc;
  };

  const calcfz = (fn: number, z: number): number => {
    const fz = fn / z;
    const fz_t = validarNumero(fz, 2);
    AsyncStorage.setItem('fresado-fz', fz_t);
    setTextfz(fz_t);
    return fz;
  };

  const calcfn1 = (vf: number, n: number): number => {
    const fn = vf / n;
    const fn_t = validarNumero(fn, 2);
    AsyncStorage.setItem('fresado-fn', fn_t);
    setTextfn(fn_t);
    return fn;
  };

  const calcfn2 = (fz: number, z: number): number => {
    const fn = fz * z;
    const fn_t = validarNumero(fn, 2);
    AsyncStorage.setItem('fresado-fn', fn_t);
    setTextfn(fn_t);
    return fn;
  };

  const calcvf = (fn: number, n: number): number => {
    const vf = fn * n;
    const vf_t = validarNumero(vf, 0);
    AsyncStorage.setItem('fresado-vf', vf_t);
    setTextvf(vf_t);
    return vf;
  };

  const calctc = (lm: number, vf: number, np: number): void => {
    const r = (lm / vf) * (np * 60);
    const tc = validarNumero(r, 1);
    AsyncStorage.setItem('fresado-tc', tc);
    setTexttc(tc);
  };

  const calcQ = (ap: number, ae: number, vf: number): void => {
    const r = (ap * ae * vf) / 1000;
    const q = validarNumero(r, 1);
    AsyncStorage.setItem('fresado-q', q);
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
      case 8: return textap;
      case 9: return textae;
      case 10: return textnp;
      case 11: return textlm;
      default: return '0';
    }
  };

  const textClick = (opcion: number | null, direccion: number) => {
    if (opcion !== null) {
      let opcion_e = opcion + direccion;
      if (opcion_e > 11) opcion_e = 11;
      else if (opcion_e === 0) opcion_e = 1;

      setBPunto([2, 3, 4, 7, 10].includes(opcion_e));
      setLockEnable(![3, 7].includes(opcion_e));

      const textoCampo = getTexto(opcion_e);
      setTextoCa(parseFloat(textoCampo) === 0 || isNaN(parseFloat(textoCampo)) ? 'CA' : 'C');
      setEditable(opcion_e);
      setPunto(0);
      
      if (direccion !== 0 && opcion_e === opcion) {
        opcion_e = editable_s + direccion;
      }
      if (opcion_e > 13) opcion_e = 13;
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
        setPunto(0);
        if (parseFloat(textoCampo) === 0 || isNaN(parseFloat(textoCampo))) {
          // Limpiar todos los campos
          const clearValues = {
            'fresado-d': '0', 'fresado-z': '0', 'fresado-n': '0', 'fresado-vc': '0',
            'fresado-fz': '0', 'fresado-fn': '0', 'fresado-vf': '0', 'fresado-tc': '0',
            'fresado-q': '0', 'fresado-ap': '0', 'fresado-ae': '0', 'fresado-np': '0',
            'fresado-lm': '0', 'fresado-ca': '0'
          };
          
          AsyncStorage.multiSet(Object.entries(clearValues));
          
          setTextD('0'); setTextZ('0'); setTextN('0'); setTextVc('0');
          setTextfz('0'); setTextfn('0'); setTextvf('0'); setTexttc('0');
          setTextQ('0'); setTextap('0'); setTextae('0'); setTextnp('0');
          setTextlm('0'); setTextoCa('0');
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
        AsyncStorage.setItem('fresado-d', textoCampo);
        updateCalculations(1, parseFloat(textoCampo));
        break;
      case 2:
        setTextZ(textoCampo);
        AsyncStorage.setItem('fresado-z', textoCampo);
        updateCalculations(2, parseFloat(textoCampo));
        break;
      case 3:
        setTextN(textoCampo);
        AsyncStorage.setItem('fresado-n', textoCampo);
        updateCalculations(3, parseFloat(textoCampo));
        break;
      case 4:
        setTextVc(textoCampo);
        AsyncStorage.setItem('fresado-vc', textoCampo);
        updateCalculations(4, parseFloat(textoCampo));
        break;
      case 5:
        setTextfz(textoCampo);
        AsyncStorage.setItem('fresado-fz', textoCampo);
        updateCalculations(5, parseFloat(textoCampo));
        break;
      case 6:
        setTextfn(textoCampo);
        AsyncStorage.setItem('fresado-fn', textoCampo);
        updateCalculations(6, parseFloat(textoCampo));
        break;
      case 7:
        setTextvf(textoCampo);
        AsyncStorage.setItem('fresado-vf', textoCampo);
        updateCalculations(7, parseFloat(textoCampo));
        break;
      case 8:
        setTextap(textoCampo);
        AsyncStorage.setItem('fresado-ap', textoCampo);
        updateCalculations(8, parseFloat(textoCampo));
        break;
      case 9:
        setTextae(textoCampo);
        AsyncStorage.setItem('fresado-ae', textoCampo);
        updateCalculations(9, parseFloat(textoCampo));
        break;
      case 10:
        setTextnp(textoCampo);
        AsyncStorage.setItem('fresado-np', textoCampo);
        updateCalculations(10, parseFloat(textoCampo));
        break;
      case 11:
        setTextlm(textoCampo);
        AsyncStorage.setItem('fresado-lm', textoCampo);
        updateCalculations(11, parseFloat(textoCampo));
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
    const ap = field === 8 ? value : parseFloat(textap);
    const ae = field === 9 ? value : parseFloat(textae);
    const np = field === 10 ? value : parseFloat(textnp);
    const lm = field === 11 ? value : parseFloat(textlm);

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
        calctc(lm, parseFloat(textvf), np);
        calcQ(ap, ae, parseFloat(textvf));
        break;
        
      case 8: // ap
      case 9: // ae
        calcQ(ap, ae, vf);
        break;
        
      case 10: // np
      case 11: // lm
        calctc(lm, vf, np);
        break;
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fresado</Text>
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => router.push('/calculator/SettingsCalculadoraScreen' as any)}
        >
          <Settings size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

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
                      colors={button === textoCa ? ['#54a2d9', '#264b9b'] : ['#ffffff', '#dddddd']}
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
              <LinearGradient colors={['#54a2d9', '#264b9b']} style={styles.buttonGradient}>
                <ChevronUp size={24} color="#ffffff" />
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={styles.arrowButton} onPress={() => editarCampo('B')}>
              <LinearGradient colors={['#54a2d9', '#264b9b']} style={styles.buttonGradient}>
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
              <Text style={styles.logoText}>ELMEC - Fresado</Text>
            </View>

            {renderInputField('Diámetro (D)', textD, medidas.mm, 1, styles.inputContainerIngresan)}
            {renderInputField('Número de filos (Z)', textZ, '', 2, styles.inputContainerIngresan)}
            {renderInputField('Velocidad de giro (N)', textN, medidas.rpm, 3, styles.inputContainerAmbos)}
            {renderInputField('Velocidad de corte (Vc)', textVc, medidas.mmin, 4, styles.inputContainerAmbos)}
            {renderInputField('Avance por filo (fz)', textfz, medidas.mm, 5, styles.inputContainerAmbos)}
            {renderInputField('Avance por revolución (fn)', textfn, medidas.mmrev, 6, styles.inputContainerAmbos)}
            {renderInputField('Velocidad de avance (Vf)', textvf, medidas.mmmin, 7, styles.inputContainerAmbos)}
            {renderInputField('Profundidad axial (ap)', textap, medidas.mm, 8, styles.inputContainerIngresan)}
            {renderInputField('Profundidad radial (ae)', textae, medidas.mm, 9, styles.inputContainerIngresan)}
            {renderInputField('Número de pasadas (Np)', textnp, '', 10, styles.inputContainerIngresan)}
            {renderInputField('Longitud de maquinado (Lm)', textlm, medidas.mm, 11, styles.inputContainerIngresan)}
            
            {/* Campos de solo lectura */}
            <View style={styles.viewRow}>
              <Text style={styles.labelRow}>Tiempo de corte (Tc)</Text>
              <View style={styles.inputContainerMuestran}>
                <Text style={styles.labelInputText}>{texttc}</Text>
              </View>
              <Text style={styles.labelMedRow}>s</Text>
            </View>

            <View style={styles.viewRow}>
              <Text style={styles.labelRow}>Tasa de remoción (Q)</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1e40af',
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingTop: 60,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
  settingsButton: {
    padding: 8,
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
    fontSize: 20,
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