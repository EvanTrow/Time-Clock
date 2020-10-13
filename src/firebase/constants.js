import firebase from 'firebase';
import config from '../config';

firebase.initializeApp(config.firebase);

export const db = firebase.firestore();
export const firebaseAuth = firebase.auth;
