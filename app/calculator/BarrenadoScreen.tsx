
import React, { useState, useEffect, useRef } from 'react';

import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
  Image,
  Pressable,
  Button,
  TouchableOpacity,
  ToastAndroid,
  ActivityIndicator,
  Modal,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

import { Dimensions } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

import * as Constants from '../constants';
import LinearGradient from 'react-native-linear-gradient';

import ViewShot from "react-native-view-shot";
import { useIsFocused, useNavigation } from '@react-navigation/native';
//import share from '../assets/svg/share.svg'
import { SvgXml } from 'react-native-svg';
import Share from 'react-native-share';

export default function  BarrenadoScreen({ navigation }) {
    const isDarkMode = useColorScheme() === 'dark';

    var width = Dimensions.get('window').width; //full width
    var height = Dimensions.get('window').height; //full height
    
    const [showLoading, setShowLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    const refScreenshot = useRef();
    
    const nav = useNavigation();
    const [medidas, setMedidaCode] = useState({});
    const [velocidadcode, setVelocidadCode] = useState('');

    const isFocused = useIsFocused()
    useEffect(()=>{
        isFocused && readData()
    },[isFocused])
    
    useEffect(() => {
        nav.setOptions({
            headerRight: () => 
                <View style={{flexDirection:'row'}}>
                    <TouchableOpacity style={{backgroundColor:'transparent'}}  onPress={text => {compartir()}} >
                        <SvgXml fill={color2} xml={Platform.OS === 'android' ?Constants.svg.shareandroid:Constants.svg.shareios} width="30" height="30" />
                    </TouchableOpacity>
                    <TouchableOpacity style={{backgroundColor:'transparent', paddingLeft:8,}}  onPress={() => {navigation.navigate('SettingsCalculadora', )}} >
                        <Image  style={[{tintColor:'rgba(38, 75, 155, 1.0)', width:30, height:30, resizeMode: 'stretch', aspectRatio:1}]} source={require('../assets/img/configuracion_header.png')}></Image>
                    </TouchableOpacity>
                </View>,
        })
    }, [])
    const readData = async () => {
        setShowLoading(true)
        setLoadingMessage("Cargando")
        AsyncStorage.multiGet([
            'user-velocidad', 
            'user-medida', 
            'barrenado-d', 
            'barrenado-z', 
            'barrenado-n',
            'barrenado-vc',
            'barrenado-fz',
            'barrenado-fn',
            'barrenado-vf',
            'barrenado-pb',
            'barrenado-nb',
            'barrenado-tc',
            'barrenado-q'], (err, barrenado) => {
                barrenado.forEach(row => {
                    if (row[0] == 'user-medida') {
                        if (row[1] !== null) {
                            if(row[1] == 'mt'){
                                setMedidaCode(Constants.medida_mt)
                            }else{
                                setMedidaCode(Constants.medida_imp)
                            }
                        }else{
                            setMedidaCode(Constants.medida_mt)
                        }
                    } else if (row[0] == 'user-velocidad') {
                        setVelocidadCode( row[1]== null? "n":row[1] );
                        if(row[1] == null || row[1] == "n"){
                            setLock( 3 );
                        }else{
                            setLock( 7 );
                        }
                        
                    } else if (row[0] == 'barrenado-d') {
                        setTextD(row[1] == null? "0":row[1]);
                    } else if (row[0] == 'barrenado-z') {
                        setTextZ( row[1] == null? "0":row[1]);
                    } else if (row[0] == 'barrenado-n') {
                        setTextN( row[1] == null? "0":row[1]);
                    } else if (row[0] == 'barrenado-vc') {
                        setTextVc( row[1] == null? "0":row[1]);
                    } else if (row[0] == 'barrenado-fz') {
                        setTextfz( row[1] == null? "0":row[1]);
                    } else if (row[0] == 'barrenado-fn') {
                        setTextfn( row[1] == null? "0":row[1]);
                    } else if (row[0] == 'barrenado-vf') {
                        setTextvf( row[1] == null? "0":row[1]);
                    } else if (row[0] == 'barrenado-pb') {
                        setTextpb( row[1] == null? "0":row[1]);
                    } else if (row[0] == 'barrenado-nb') {
                        setTextnb( row[1] == null? "0":row[1]);
                    } else if (row[0] == 'barrenado-tc') {
                        setTexttc( row[1] == null? "0":row[1]);
                    } else if (row[0] == 'barrenado-q') {
                        setTextQ( row[1] == null? "0":row[1]);
                    }
                });
                setTimeout(function() {
                    setShowLoading(false)
                }, 500);
            })
    }

    function compartir(){
        refScreenshot.current.capture().then(uri => {
            var options = {
                url: `data:image/jpeg;base64,` + uri, // Platform.OS === 'android'? uri: 'file://'+ uri,
                type: 'image/jpeg',
            }
            
            Share.open(options)
            .then((res) => {
                //console.log("then");
                //console.log(res);
            })
            .catch((err) => {
                //console.log("catch");
                err && console.log(err);
            });
        });
    }
    var color1 = 'rgba(84, 162, 217, 1.0)'
    var color2 = 'rgba(38, 75, 155, 1.0)'
    var color2a = 'rgba(38, 75, 155, 0.7)'
    var color3 = 'rgba(32, 43, 82, 1.0)'
    var color4 = 'green'//'rgba(209, 233, 240, 1.0)'
    var color5 = 'rgba(24, 30, 53, 1.0)'
    var color6 = 'rgba(233, 233, 229, 1.0)'
    
    var color1b = 'rgba(84, 162, 217, 0.8)'
    var color2b = 'rgba(38, 75, 155, 0.10)'
    var color3b = 'rgba(32, 43, 82, 0.8)'
    var color4b = 'rgba(209, 233, 240, 0.8)'
    var color5b = 'rgba(24, 30, 53, 0.8)'
    var color6b = 'rgba(233, 233, 229, 0.10)';

    const [editable, setEditable] = useState(0);
    const [editable_s, setEditableS] = useState(0);
    const [punto, setPunto] = useState(0);
    const [bPunto, setBPunto] = useState(false);
    const [scrollHeight, setScrollHeight] = useState("100%");
    const [keyboarHeight, setKeyboarHeight] = useState("0%");
    const [scrolly, setScrollY] = useState(0);
    const [scrollH, setScrollH] = useState(0);
    const [textH, setTextH] = useState(0);

    
    const [lock, setLock] = useState(3);
    const [lockenable, setLockEnable] = useState(true);


    const backgroundStyle = {
      backgroundColor: Colors.lighter, //isDarkMode ? Colors.darker : Colors.lighter,
    };
    const inputStyle ={
        color: Colors.black, 
    };
    const viewRow = {
        marginLeft: 15,
        marginRight:15,
        alignItems: 'center',
        backgroundColor:  Colors.white,
        flexDirection:'row',
    }
    const labelRow = {
        alignItems: 'center',
        textAlign: 'right',
        color: Colors.black,
        flex: 3, 
        fontFamily:'TitilliumWeb-Regular',
        fontSize:height * 0.02,
        marginRight:5,
    }
    const labelInputText = {
        color: Colors.black,
        fontSize:height * 0.025,
        fontFamily:'TitilliumWeb-Regular',
        margin: 1,
        textAlign: 'center',
    }
    const labelMedRow = {
        color: Colors.black,
        fontFamily:'TitilliumWeb-Regular',
        flex: 1, 
        fontSize:height * 0.02,
    }

    const inputContainerSelected = {
        margin:5,
        flex: 3,
        color:Colors.green,
        borderLeftWidth: 5,
        borderRightWidth: 5,
        borderTopWidth: 5,
        borderBottomWidth: 5,

        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        borderColor: color4,
        backgroundColor: color4b,
        //borderColor: '#202b52',
        width: '100%',//width/3,
    };

    const inputContainerIngresan = {
        margin:5,
        flex: 3,
        color:Colors.green,
        borderLeftWidth: 5,
        borderRightWidth: 5,
        borderTopWidth: 5,
        borderBottomWidth: 5,

        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        borderColor: color2,
        backgroundColor: color2b,
        //borderColor: '#202b52',
        width: '100%',//width/3,
    };
    
    const inputContainerAmbos = {
        margin:5,
        flex: 3,
        color:Colors.green,
        borderLeftWidth: 5,
        borderRightWidth: 5,
        borderTopWidth: 5,
        borderBottomWidth: 5,

        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        borderColor: color2a,
        backgroundColor: color2b,
        width: '100%',//width/3,
    };
    
    const inputContainerMuestran = {
        margin:5,
        flex: 3,
        color:Colors.green,
        borderLeftWidth: 5,
        borderRightWidth: 5,
        borderTopWidth: 5,
        borderBottomWidth: 5,

        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        borderColor: color6,
        backgroundColor: color6b,
        width: '100%',//width/3,
    };

    const textinputstyle = {
        color: Colors.black,
        textAlign: 'center', 
        fontSize:20,
    }

    const calcView = {
        flex:1,
        margin:10,
    }

    const calcButton = {
        margin:5,
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 5,
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
        alignItems:'center',
        backgroundColor:'#DDDDDD',
        elevation:10,// Android
        shadowOpacity: 1, // IOS
        shadowRadius: 1, //IOS
        shadowColor: 'rgba(0,0,0, .4)', // IOS
        shadowOffset: { height: 1, width: 1 }, // IOS
        flex:1,
        justifyContent:'center',
    }

    const calcButton2 = {
        margin:5,
        borderRadius: 5,
        backgroundColor:'#DDDDDD',
        alignItems:'center',
        elevation:5,// Android
        shadowOpacity: 1, // IOS
        shadowRadius: 1, //IOS
        shadowColor: 'rgba(0,0,0, .4)', // IOS
        shadowOffset: { height: 1, width: 1 }, // IOS
        flex:1,
        //fontSize:13,
        justifyContent:'center',
    }
    
    const calcButtonPunto = {
        margin:5,
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 5,
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
        backgroundColor:'#DDDDDD',
        //backgroundColor: bPunto == true ? '#cccccc' : 'white',
        alignItems:'center',
        elevation:10,// Android
        shadowOpacity: 1, // IOS
        shadowRadius: 1, //IOS
        shadowColor: 'rgba(0,0,0, .4)', // IOS
        shadowOffset: { height: 1, width: 1 }, // IOS
        flex:1,
        justifyContent:'center',
    }

    const calcText = {
        fontSize:height * 0.03,
        color:'white',
        fontFamily:'TitilliumWeb-Bold',
    }
    const calcText2 = {
        fontSize:height * 0.03,
        color:Constants.colores.textColor,
        fontFamily:'TitilliumWeb-Bold',
    }
    
    
    const tsubir = "<"
    const tbajar = ">"
    const calcTextFlechas = {
        fontSize:height * 0.05,
        color:'white',
        lineHeight: height * 0.05,
        transform: [{ rotate: '90deg'}],
    }
    

    const [textD, setTextD] = useState("0");
    const [textZ, setTextZ] = useState("0");
    const [textN, setTextN] = useState("0");
    const [textVc, setTextVc] = useState("0");
    const [textfz, setTextfz] = useState("0");
    const [textfn, setTextfn] = useState("0");
    const [textvf, setTextvf] = useState("0");
    const [textpb, setTextpb] = useState("0");
    const [textnb, setTextnb] = useState("0");
    const [texttc, setTexttc] = useState("0");
    const [textQ, setTextQ] = useState("0");
    const [textoCa,setTextoCa] = useState("0");
    const [dataSourceCords, setDataSourceCords] = useState([]);
    const [ref, setRef] = useState(null);
    
    
    

    function calcN(D, vc){
        const n = ( (vc * 1000.0) / (Math.PI * D));
        const n_t = validarNumero(n,0)

        AsyncStorage.setItem('barrenado-n', `${n_t}`);
        setTextN(n_t);
        return n;
    }
    
    
    function calcN2(vf, fn){
        const n = (vf/fn)
        const n_t = validarNumero(n,0)

        AsyncStorage.setItem('barrenado-n', `${n_t}`);
        setTextN(n_t);
        return n;
    }
    
    
    function calcVc(D, n){
        const Vc = (Math.PI * D * n) / 1000;
        const vc_t = validarNumero(Vc,0);

        AsyncStorage.setItem('barrenado-vc', `${vc_t}`);
        setTextVc( vc_t );
        return Vc;
    }
    
    function calcfz(fn,z){
        const fz = ( fn / z);
        const fz_t = validarNumero(fz,2);

        AsyncStorage.setItem('barrenado-fz', `${fz_t}`);
        setTextfz(fz_t);
        return fz;
    };

    
    function calcfn1(vf,n){
        const fn = ( vf / n);
        const fn_t = validarNumero(fn,2);

        AsyncStorage.setItem('barrenado-fn', `${fn_t}`);
        setTextfn(validarNumero(fn,2));
        return fn;
    }

    function calcfn2(fz,z){
        const fn = ( fz * z);
        const fn_t = validarNumero(fn,2);

        AsyncStorage.setItem('barrenado-fn', `${fn_t}`);
        setTextfn(fn_t);
        return fn;
    };
    function calcvf(fn, n){
        var vf = ( fn * n);
        const vf_t = validarNumero(vf,0);

        AsyncStorage.setItem('barrenado-vf', `${vf_t}`);
        setTextvf(vf_t);
        return vf;
    };

    function calctc(pb, vf, nb){
        //ToastAndroid.show(text, ToastAndroid.LONG);
        const r = (( pb * 60 ) / vf ) *  nb;
        const tc= validarNumero(r,2);

        AsyncStorage.setItem('barrenado-tc', `${tc}`);
        setTexttc(tc);
    };
    function calcQ(D, vf){
        //ToastAndroid.show(text, ToastAndroid.LONG);
        const r = (( Math.PI * D * D ) / 4 * vf)/1000;
        const q = validarNumero(r,2);
        
        AsyncStorage.setItem('barrenado-q', `${q}`);
        setTextQ(q);
    };
    

    function textClick(opcion, direccion){
        if(opcion != null){

            var opcion_e = opcion + direccion;
            if(opcion_e > 9){
                opcion_e = 9;
            }else if(opcion_e == 0){
                opcion_e = 1;
            }
            


            if(opcion_e == 2 || opcion_e == 3 || opcion_e == 4 || opcion_e == 7 || opcion_e == 9){
                setBPunto(true);
            }else{
                setBPunto(false);
            }

            if(opcion_e == 3 || opcion_e == 7){
                setLockEnable(false)
            }else{
                setLockEnable(true)
            }

            var textoCampo = getTexto(opcion_e);
            if(parseFloat(textoCampo) == 0 || isNaN(parseFloat(textoCampo)) ){
                setTextoCa("CA")
            }else{
                setTextoCa("C")
            }
            setEditable(opcion_e);
            setPunto(0);
            if(direccion!=0){
                if(opcion_e == opcion){
                    opcion_e = editable_s + direccion;
                }
            }
            if(opcion_e > 11){
                opcion_e = 11;
            }
            setEditableS(opcion_e);


            setScrollHeight('70%');
            setKeyboarHeight('30%');

            setTimeout(() => {
                
                if(opcion_e<1){
                    ref.scrollTo({
                        x: 0,
                        y: (0),
                        animated: true,
                    });
                }else{
                    if(dataSourceCords[''+opcion_e] < scrolly){
                        ref.scrollTo({
                            x: 0,
                            y: (dataSourceCords[''+opcion_e]),
                            animated: true,
                        });
                    }else if (( dataSourceCords[''+opcion_e] + textH ) > (scrolly + scrollH) ){
                        ref.scrollTo({
                            x: 0,
                            y: ( dataSourceCords[''+opcion_e] + textH) - (scrollH),
                            animated: true,
                        });
                    }
                }
                
            }, 50);
            
        }else{
            setEditable(0);
            setPunto(0);
            setScrollHeight('100%');
            setKeyboarHeight('0%');
        }
        
        
    }

    function getTexto(opcion){
        var texto = ""
        switch(opcion){
            case 1:
                texto = textD;
                break;
            case 2:
                texto = textZ;
                break;
            case 3:
                texto = textN;
                break;
            case 4:
                texto = textVc;
                break;
            case 5:
                texto = textfz;
                break;
            case 6:
                texto = textfn;
                break;
            case 7:
                texto = textvf;
                break;
            case 8:
                texto = textpb;
                break;
            case 9:
                texto = textnb;
                break;
        }
        return texto
    }

    function bloquear(){

    }
    
    function editarCampo(boton){
        var textoCampo = getTexto(editable);

        //textoCampo = parseFloat(textoCampo).toString()
        /*if(punto == 1){
            textoCampo += '.';
        }*/
        
        switch(boton){
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
            case '0':
                if(textoCampo == '0'  || isNaN(parseFloat(textoCampo)) || !isFinite(parseFloat(textoCampo)) ){
                    textoCampo = ''
                }
                
                if(editable == punto){
                    if(parseFloat(textoCampo) == 0  || isNaN(parseFloat(textoCampo)) || !isFinite(parseFloat(textoCampo)) ){
                        textoCampo = '0'
                    }
                    if(!textoCampo.includes(".")){
                        textoCampo += '.'
                    }
                    setPunto(0)
                }
                textoCampo += boton;
                break;
            case 'C':
                
                if(parseFloat(textoCampo) == 0 || isNaN(parseFloat(textoCampo)) ){
                    setTextD('0')
                    setTextZ('0')
                    setTextN('0');
                    setTextVc('0');
                    setTextfz('0');
                    setTextfn('0');
                    setTextvf('0');
                    setTextpb('0');
                    setTextnb('0');
                    setTexttc('0');
                    setTextQ('0');
                    
                    AsyncStorage.setItem('barrenado-d', '0');
                    AsyncStorage.setItem('barrenado-z', '0');
                    AsyncStorage.setItem('barrenado-n', '0');
                    AsyncStorage.setItem('barrenado-vc', '0');
                    AsyncStorage.setItem('barrenado-fz', '0');
                    AsyncStorage.setItem('barrenado-fn', '0');
                    AsyncStorage.setItem('barrenado-vf', '0');
                    AsyncStorage.setItem('barrenado-pb', '0');
                    AsyncStorage.setItem('barrenado-nb', '0');
                    AsyncStorage.setItem('barrenado-tc', '0');
                    AsyncStorage.setItem('barrenado-q', '0');
                    
                }else{
                    textoCampo = '0';
                    
                }
                break;
            case '.':
                setPunto(editable);
                if(!textoCampo.includes(".")){
                    textoCampo += '.'
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
        if(parseFloat(textoCampo) == 0 || isNaN(parseFloat(textoCampo)) ){
            setTextoCa("CA")
        }else{
            setTextoCa("C")
        }
        /*
        if(textoCampo[0] == '0'){
            textoCampo
        }*/
        
        switch(editable){
            case 1:
                setTextD(textoCampo)
                
                AsyncStorage.setItem('barrenado-d', `${textoCampo}`);
                textoCampo = parseFloat(textoCampo)//.toFixed(3);
                var D = textoCampo;
                var fn = parseFloat(textfn);
                var Vc = parseFloat(textVc);

                var n = parseFloat(textN);
                var vf = parseFloat(textvf);
                if(lock == 3){
                    Vc = calcVc(D, n);
                    vf = calcvf(fn,n);
                }else{
                    if(velocidadcode == 'n'){
                        n = calcN2(vf, fn)
                    }else{//fn
                        n = calcN(D, Vc);
                    }
                    Vc = calcVc(D, n);
                    
                }
                
                var pb = parseFloat(textpb);
                var nb = parseFloat(textnb);

                calctc(pb,vf,nb);
                calcQ(D,vf);

                break;
            case 2:
                setTextZ(textoCampo)
                
                AsyncStorage.setItem('barrenado-z', `${textoCampo}`);
                textoCampo = parseFloat(textoCampo)//.toFixed(0);
                var z = textoCampo;
                
                var fn = parseFloat(textfn); 
                var fz = parseFloat(textfz);
                var vf = parseFloat(textvf);
                var n = parseFloat(textN);
                
                if(lock == 7){
                    vf = parseFloat(textvf);
                    if(velocidadcode == 'n'){
                        fn = calcfn2(fz, z);
                    }else{
                        fn = calcfn1(vf, n);
                    }
                }else{
                    fn = calcfn2(fz, z);
                    vf = calcvf(fn,n);
                }
                fz = calcfz(fn, z);
                
                
                var D = parseFloat(textD);
                var pb = parseFloat(textpb);
                var nb = parseFloat(textnb);

                calctc(pb,vf,nb);
                calcQ(D,vf);


                
                break;
            case 3:
                setTextN(textoCampo);
                AsyncStorage.setItem('barrenado-n', `${textoCampo}`);
                textoCampo = parseFloat(textoCampo)//.toFixed(0);
                var n = textoCampo;
                var D = parseFloat(textD);
                var fn = parseFloat(textfn);

                var Vc = calcVc(D, n);
                var vf = 0;
                if(lock == 7){
                    vf = parseFloat(textvf);
                }else{
                    vf = calcvf(fn,n);
                }
                
                var pb = parseFloat(textpb);
                var nb = parseFloat(textnb);

                calctc(pb,vf,nb);
                calcQ(D,vf);
                
                break;
            case 4:
                setTextVc(textoCampo);
                AsyncStorage.setItem('barrenado-vc', `${textoCampo}`);
                textoCampo = parseFloat(textoCampo)//.toFixed(0);
                var Vc = textoCampo;
                                
                var D = parseFloat(textD);
                var fn = parseFloat(textfn);
                var n = parseFloat(textN);
                var vf = 0;
                if(lock == 7){
                    vf = parseFloat(textvf);
                    if(velocidadcode == 'n'){
                        n = calcN2(vf, fn)
                    }else{
                        n = calcN(D, Vc);
                    }
                }else if(lock == 3){
                    vf = calcvf(fn,n);
                }else{
                    vf = calcvf(fn,n);
                    n = calcN(D, Vc);
                }


                
                var pb = parseFloat(textpb);
                var nb = parseFloat(textnb);

                calctc(pb,vf,nb);
                calcQ(D,vf);
                break;
            case 5:
                setTextfz(textoCampo);
                AsyncStorage.setItem('barrenado-fz', `${textoCampo}`);
                textoCampo = parseFloat(textoCampo)//.toFixed(0);
                var fz = textoCampo;

                var z = parseFloat(textZ);
                var fn = parseFloat(textfn); 
                var n = parseFloat(textN); 

                if(lock == 7){
                    vf = parseFloat(textvf);
                    if(velocidadcode == 'n'){
                        fn = calcfn2(fz, z);
                    }else{
                        fn = calcfn1(vf, n);
                    }
                }else{
                    fn = calcfn2(fz, z);
                    vf = calcvf(fn,n);
                }
                

                var D = parseFloat(textD);
                var pb = parseFloat(textpb);
                var nb = parseFloat(textnb);

                calctc(pb,vf,nb);
                calcQ(D,vf);
                break;
            case 6:
                setTextfn(textoCampo);
                AsyncStorage.setItem('barrenado-fn', `${textoCampo}`);
                textoCampo = parseFloat(textoCampo)//.toFixed(0);
                var fn = textoCampo;


                var z = parseFloat(textZ);
                var n = parseFloat(textN);
                
                var fz = calcfz(fn,z);
                var vf = 0;
                if(lock == 7){
                    vf = parseFloat(textvf);
                }else{
                    vf = calcvf(fn,n);
                }
                
                var D = parseFloat(textD);
                var pb = parseFloat(textpb);
                var nb = parseFloat(textnb);

                calctc(pb,vf,nb);
                calcQ(D,vf);
                
                break;
            case 7:
                setTextvf(textoCampo);
                AsyncStorage.setItem('barrenado-vf', `${textoCampo}`);
                textoCampo = parseFloat(textoCampo)//.toFixed(0);
                var vf = textoCampo;

                var D = parseFloat(textD);
                var pb = parseFloat(textpb);
                var nb = parseFloat(textnb);
                var fn = parseFloat(textfn);
                var n = parseFloat(textN);
                if(lock == 7){
                    if(velocidadcode == 'n'){
                        n = calcN2(vf, fn)
                    }else{//fn
                        fn = calcfn1(vf,n)
                    }
                }

                calctc(pb, vf, nb);
                calcQ(D, vf);
                break;
            case 8:
                setTextpb(textoCampo);
                AsyncStorage.setItem('barrenado-pb', `${textoCampo}`);
                textoCampo = parseFloat(textoCampo)//.toFixed(0);
                var pb = textoCampo;

                var vf = parseFloat(textvf);
                var nb = parseFloat(textnb);
                calctc(pb, vf, nb);
                break;
            case 9:
                setTextnb(textoCampo);
                AsyncStorage.setItem('barrenado-nb', `${textoCampo}`);
                textoCampo = parseFloat(textoCampo)//.toFixed(0);
                var nb = textoCampo;
                                
                var pb = parseFloat(textpb);
                var vf = parseFloat(textvf);
                calctc(pb, vf, nb);

                break;
        }
    }
    function validarNumero(numero,decimales){
        if(numero == 0 || isNaN(numero) || !isFinite(numero)){
            return '0';
        }else{
            return numero.toFixed(decimales).toString();
        }
        
    }
    
    const { t } = useTranslation();
    return (
        <View 
            onLayout={(event) => {
                setScrollH((event.nativeEvent.layout.height * .7))
            }}
            style={{
                backgroundColor: Colors.white, flexDirection:'column-reverse'
            }} >
            <Modal transparent={true} animationType="none" visible={showLoading}>
                <View
                    style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: `rgba(0,0,0,0.6)`
                    }}
                >
                    <View
                    style={{
                        padding: 13,
                        backgroundColor: `white`,
                        borderRadius: 13
                    }}
                    >
                    <ActivityIndicator animating={showLoading} color={'black'} size="large"/>
                    <Text style={{ color: `black` }}>{loadingMessage}</Text>
                    </View>
                </View>
            </Modal>
            <View style={{ height:keyboarHeight, flexDirection:'row'
            }} >
                <View style={{flexDirection:'column', flex:8, marginTop:5, marginLeft:5, marginBottom:5, }}>
                    <View style={{flexDirection:'row',flex:1, }}>
                        <TouchableOpacity style={calcButton2} onPress={text =>{editarCampo('1')}} >
                            <LinearGradient colors={['#FFFFFF', '#DDDDDD',  ]} style={[Constants.styles.gradientCalc2, {flexDirection:'column',}]}>
                                <Text style={calcText2}>1</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                        <TouchableOpacity style={calcButton2} onPress={text =>{editarCampo('2')}} >
                            <LinearGradient colors={['#FFFFFF', '#DDDDDD',  ]} style={[Constants.styles.gradientCalc2, {flexDirection:'column',}]}>
                                <Text style={calcText2}>2</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                        <TouchableOpacity style={calcButton2} onPress={text =>{editarCampo('3')}} >
                            <LinearGradient colors={['#FFFFFF', '#DDDDDD',  ]} style={[Constants.styles.gradientCalc2, {flexDirection:'column',}]}>
                                <Text style={calcText2}>3</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                    <View style={{flexDirection:'row',flex:1}}>
                        <TouchableOpacity style={calcButton2} onPress={text =>{editarCampo('4')}} >
                            <LinearGradient colors={['#FFFFFF', '#DDDDDD',  ]} style={[Constants.styles.gradientCalc2, {flexDirection:'column',}]}>
                                <Text style={calcText2}>4</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                        <TouchableOpacity style={calcButton2} onPress={text =>{editarCampo('5')}} >
                            <LinearGradient colors={['#FFFFFF', '#DDDDDD',  ]} style={[Constants.styles.gradientCalc2, {flexDirection:'column',}]}>
                                <Text style={calcText2}>5</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                        <TouchableOpacity style={calcButton2} onPress={text =>{editarCampo('6')}} >
                            <LinearGradient colors={['#FFFFFF', '#DDDDDD',  ]} style={[Constants.styles.gradientCalc2, {flexDirection:'column',}]}>
                                <Text style={calcText2}>6</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                    <View style={{flexDirection:'row',flex:1}}>
                        <TouchableOpacity style={calcButton2} onPress={text =>{editarCampo('7')}} >
                            <LinearGradient colors={['#FFFFFF', '#DDDDDD',  ]} style={[Constants.styles.gradientCalc2, {flexDirection:'column',}]}>
                                <Text style={calcText2}>7</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                        <TouchableOpacity style={calcButton2} onPress={text =>{editarCampo('8')}} >
                            <LinearGradient colors={['#FFFFFF', '#DDDDDD',  ]} style={[Constants.styles.gradientCalc2, {flexDirection:'column',}]}>
                                <Text style={calcText2}>8</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                        <TouchableOpacity style={calcButton2} onPress={text =>{editarCampo('9')}} >
                            <LinearGradient colors={['#FFFFFF', '#DDDDDD',  ]} style={[Constants.styles.gradientCalc2, {flexDirection:'column',}]}>
                                <Text style={calcText2}>9</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                    <View style={{flexDirection:'row',flex:1,}}>
                        <TouchableOpacity style={calcButton} onPress={text =>{editarCampo('C')}} >
                            <LinearGradient colors={[Constants.colores.iconColor, Constants.colores.textColor,  ]} style={[Constants.styles.gradientCalc2, {flexDirection:'column',}]}>
                                <Text style={calcText}>{textoCa}</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                        <TouchableOpacity style={calcButton2} onPress={text =>{editarCampo('0')}} >
                            <LinearGradient colors={['#FFFFFF', '#DDDDDD',  ]} style={[Constants.styles.gradientCalc2, {flexDirection:'column',}]}>
                                <Text style={calcText2}>0</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                        <TouchableOpacity style={calcButtonPunto} onPress={text =>{editarCampo('.')}} disabled={bPunto} >
                            <LinearGradient colors={[ bPunto == true ? '#cccccc' : 'white',  bPunto == true ? '#cccccc' :'#DDDDDD', ]} style={[Constants.styles.gradientCalc2, {flexDirection:'column',}]}>
                                <Text style={calcText2}>.</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{ flex:3, marginTop:5, marginRight:5, marginBottom:5,}}>
                    <TouchableOpacity style={calcButton} onPress={text =>{editarCampo('S')}}>
                        <LinearGradient colors={[Constants.colores.iconColor, Constants.colores.textColor,  ]} style={[Constants.styles.gradientCalc2, {flexDirection:'column',}]}>
                            <Text style={calcTextFlechas}>{tsubir}</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                    <TouchableOpacity style={calcButton} onPress={text =>{editarCampo('B')}}>
                        <LinearGradient colors={[Constants.colores.iconColor, Constants.colores.textColor,  ]} style={[Constants.styles.gradientCalc2, { flexDirection:'column',}]}>
                            <Text style={[calcTextFlechas, ]}>{tbajar}</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
            <ScrollView
                ref={(ref) => {
                setRef(ref);
                }}
                onScroll={event => { 
                setScrollY(event.nativeEvent.contentOffset.y)
                }}
                style={{ height:scrollHeight,
                backgroundColor: Colors.white, flexDirection:'column'
                }} >
                    <ViewShot ref={refScreenshot} options={{ fileName: "barrenado", format: "jpg", quality: 0.9, result:'base64' }} style={{backgroundColor: Colors.white,}}>
                        <Pressable 
                            onPress={text => {textClick(null, 0)}}>
                            <View style={{justifyContent: 'center', alignItems: 'center', margin:20, }}>
                                <Image source={require('../assets/img/logo.png')}></Image>
                            </View>
                            <View
                                style={viewRow}
                                onLayout={(event) => {
                                    setTextH(event.nativeEvent.layout.height);
                                    const layout = event.nativeEvent.layout;
                                    dataSourceCords[1] = layout.y;
                                    setDataSourceCords(dataSourceCords);
                                }}>
                                <Text style={labelRow} >{t('barrenado:d')}</Text>
                                <View style={[editable == 1 ? inputContainerSelected : inputContainerIngresan]}>
                                    <TouchableOpacity style={textinputstyle} onPress={text => {textClick(1, 0)}} >
                                        <Text style={labelInputText} >{textD}</Text>
                                    </TouchableOpacity>
                                </View>
                                <Text style={labelMedRow} >{medidas['mm']}</Text>
                            </View>
                            <View
                                style={viewRow}
                                onLayout={(event) => {
                                    const layout = event.nativeEvent.layout;
                                    dataSourceCords[2] = layout.y;
                                    setDataSourceCords(dataSourceCords);
                                }}>
                                <Text style={labelRow} >{t('barrenado:z')}</Text>
                                <View style={[editable == 2 ? inputContainerSelected : inputContainerIngresan]}>
                                    <TouchableOpacity style={textinputstyle} onPress={text => {textClick(2, 0)}} >
                                        <Text style={labelInputText} >{textZ}</Text>
                                    </TouchableOpacity>
                                </View>
                                <Text style={labelMedRow} ></Text>
                            </View>
                            <View
                                style={viewRow}
                                onLayout={(event) => {
                                    const layout = event.nativeEvent.layout;
                                    dataSourceCords[3] = layout.y;
                                    setDataSourceCords(dataSourceCords);
                                }}>
                                <Text style={labelRow} >{t('barrenado:n')}</Text>
                                <View style={[editable == 3 ? inputContainerSelected : inputContainerAmbos,{alignItems:'center',flexDirection:'row'}]}>
                                    <TouchableOpacity style={[textinputstyle,{flex:1}]} onPress={text => {textClick(3, 0)}} >
                                        <Text style={labelInputText} >{textN}</Text>
                                    </TouchableOpacity>
                                </View>
                                <Text style={labelMedRow} >{medidas['rpm']}</Text>
                            </View>
                            <View
                                style={viewRow}
                                onLayout={(event) => {
                                    const layout = event.nativeEvent.layout;
                                    dataSourceCords[4] = layout.y;
                                    setDataSourceCords(dataSourceCords);
                                }}>
                                <Text style={labelRow} >{t('barrenado:vc')}</Text>
                                <View style={[editable == 4 ? inputContainerSelected : inputContainerAmbos]}>
                                    <TouchableOpacity style={textinputstyle} onPress={text => {textClick(4, 0)}} >
                                        <Text style={labelInputText} >{textVc}</Text>
                                    </TouchableOpacity>
                                </View>
                                <Text style={labelMedRow} >{medidas['mmin']}</Text>
                            </View>
                            <View
                                style={viewRow}
                                onLayout={(event) => {
                                    const layout = event.nativeEvent.layout;
                                    dataSourceCords[5] = layout.y;
                                    setDataSourceCords(dataSourceCords);
                                }}>
                                <Text style={labelRow} >{t('barrenado:fz')}</Text>
                                <View style={[editable == 5 ? inputContainerSelected : inputContainerAmbos]}>
                                    <TouchableOpacity style={textinputstyle} onPress={text => {textClick(5, 0)}} >
                                        <Text style={labelInputText} >{textfz}</Text>
                                    </TouchableOpacity>
                                </View>
                                <Text style={labelMedRow} >{medidas['mm']}</Text>
                            </View>
                            <View
                                style={viewRow}
                                onLayout={(event) => {
                                    const layout = event.nativeEvent.layout;
                                    dataSourceCords[6] = layout.y;
                                    setDataSourceCords(dataSourceCords);
                                }}>
                                <Text style={labelRow} >{t('barrenado:fn')}</Text>
                                <View style={[editable == 6 ? inputContainerSelected : inputContainerAmbos]}>
                                    <TouchableOpacity style={textinputstyle} onPress={text => {textClick(6, 0)}} >
                                        <Text style={labelInputText} >{textfn}</Text>
                                    </TouchableOpacity>
                                </View>
                                <Text style={labelMedRow} >{medidas['mmrev']}</Text>
                            </View>
                            
                            <View
                                style={viewRow}
                                onLayout={(event) => {
                                    const layout = event.nativeEvent.layout;
                                    dataSourceCords[7] = layout.y;
                                    setDataSourceCords(dataSourceCords);
                                }}>
                                <Text style={labelRow} >{t('barrenado:vf')}</Text>
                                <View style={[editable == 7 ? inputContainerSelected : inputContainerAmbos,{flexDirection:'row', alignItems:'center'}]}>
                                    <TouchableOpacity style={[textinputstyle,{flex:1,}]} onPress={text => {textClick(7, 0)}} >
                                        <Text style={labelInputText} >{textvf}</Text>
                                    </TouchableOpacity>
                                </View>
                                <Text style={labelMedRow} >{medidas['mmmin']}</Text>
                            </View>
                            
                            <View
                                style={viewRow}
                                onLayout={(event) => {
                                    const layout = event.nativeEvent.layout;
                                    dataSourceCords[8] = layout.y;
                                    setDataSourceCords(dataSourceCords);
                                }}>
                                <Text style={labelRow} >{t('barrenado:pb')}</Text>
                                <View style={[editable == 8 ? inputContainerSelected : inputContainerIngresan]}>
                                    <TouchableOpacity style={textinputstyle} onPress={text => {textClick(8, 0)}} >
                                        <Text style={labelInputText} >{textpb}</Text>
                                    </TouchableOpacity>
                                </View>
                                <Text style={labelMedRow} >{medidas['mm']}</Text>
                            </View>
                            
                            <View
                                style={viewRow}
                                onLayout={(event) => {
                                    const layout = event.nativeEvent.layout;
                                    dataSourceCords[9] = layout.y;
                                    setDataSourceCords(dataSourceCords);
                                }}>
                                <Text style={labelRow} >{t('barrenado:nb')}</Text>
                                <View style={[editable == 9 ? inputContainerSelected : inputContainerIngresan]}>
                                    <TouchableOpacity style={textinputstyle} onPress={text => {textClick(9, 0)}} >
                                        <Text style={labelInputText} >{textnb}</Text>
                                    </TouchableOpacity>
                                </View>
                                <Text style={labelMedRow} ></Text>
                            </View>
                            
                            <View
                                style={viewRow}
                                onLayout={(event) => {
                                    const layout = event.nativeEvent.layout;
                                    dataSourceCords[10] = layout.y;
                                    setDataSourceCords(dataSourceCords);
                                }}>
                                <Text style={labelRow} >{t('barrenado:tc')}</Text>
                                <View style={inputContainerMuestran}>
                                    <Text style={labelInputText} >{texttc}</Text>
                                </View>
                                <Text style={labelMedRow} >s</Text>
                            </View>
                            
                            
                            <View
                                style={viewRow}
                                onLayout={(event) => {
                                    const layout = event.nativeEvent.layout;
                                    dataSourceCords[11] = layout.y;
                                    setDataSourceCords(dataSourceCords);
                                }}>
                                <Text style={labelRow} >{t('barrenado:q')}</Text>
                                
                                <View style={inputContainerMuestran}>
                                    <Text style={labelInputText} >{textQ}</Text>
                                </View>
                                <Text style={labelMedRow} >{medidas['cm3min']}</Text>
                            </View>
                        </Pressable>
                    </ViewShot>
            </ScrollView>
        </View>
      
    );
  };
