import firebase from 'firebase';
import { firebaseAuth } from './constants';
import config from '../config';

export function logout() {
	return firebaseAuth().signOut();
}

export function login(email, pw) {
	return firebaseAuth().signInWithEmailAndPassword(email + '@' + config.domain, pw);
}

var provider = new firebase.auth.OAuthProvider('microsoft.com');
provider.setCustomParameters({
	tenant: config.Microsoft.azureTenantId,
});
export function loginWithMicrosoft() {
	return firebaseAuth()
		.signInWithPopup(provider)
		.then(function (linkResult) {
			// Sign in with the newly linked credential
			return firebase.auth().signInWithCredential(linkResult.credential);
		});
}
export function linkMicrosoft() {
	return firebase.auth().currentUser.linkWithPopup(provider);
}

export function resetPassword(email) {
	return firebaseAuth().sendPasswordResetEmail(email + '@' + config.domain);
}

export function getUserProfile() {
	return firebase.auth().currentUser;
}

export function updateDisplayName(name) {
	var user = firebase.auth().currentUser;
	return user.updateProfile({
		displayName: name,
	});
}

export function changePassword(email, currentPassword, newPassword) {
	var user = firebase.auth().currentUser;
	var credential = firebase.auth.EmailAuthProvider.credential(email, currentPassword);
	return user
		.reauthenticateWithCredential(credential)
		.then(function () {
			user.updatePassword(newPassword);
		})
		.catch(function (error) {
			// An error happened.
		});
}
