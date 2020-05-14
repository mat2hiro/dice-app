import firebase from 'firebase'

if (!firebase.apps.length) {
  firebase.initializeApp({
    apiKey: 'AIzaSyBiuihxh4bO0Xm4I8Sg2HzennuxxvR-qT4',
    authDomain: 'mnpl-app.firebaseapp.com',
    databaseURL: 'https://mnpl-app.firebaseio.com',
    projectId: 'mnpl-app',
    storageBucket: 'mnpl-app.appspot.com',
    messagingSenderId: '167003963939',
    appId: '1:167003963939:web:936a9f2effd1575b152796',
    measurementId: 'G-PTV0FB76J8'
  })
}

export default firebase
