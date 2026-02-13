import {
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
} from 'amazon-cognito-identity-js';
import userPool from './cognitoUserPool';

export const signUp = (email, password) => {
  return new Promise((resolve, reject) => {
    const attributeList = [
      new CognitoUserAttribute({
        Name: 'email',
        Value: email,
      }),
    ];

    userPool.signUp(email, password, attributeList, null, (err, result) => {
      if (err) {
        console.error('SignUp error:', err);
        reject(err);
        return;
      }
      console.log('SignUp success:', result);
      resolve(result);
    });
  });
};

export const codeVerification = ({ email, code }) => {
  const user = new CognitoUser({
    Username: email,
    Pool: userPool,
  });

  return new Promise((resolve, reject) => {
    user.confirmRegistration(code, true, (err, result) => {
      if (err) {
        console.error('Code verification error:', err);
        reject(err);
        return;
      }
      console.log('Code verification success:', result);
      resolve({ success: true, message: 'Verificación exitosa' });
    });
  });
};

export const signIn = (email, password) => {
  // Sign in the user with Cognito and store the original expiration time in localStorage
  // original_exp: Expiration time of the original token
  // cognitoToken: The Cognito token used for authentication
  
  const user = new CognitoUser({
    Username: email,
    Pool: userPool,
  });

  const authDetails = new AuthenticationDetails({
    Username: email,
    Password: password,
  });

  return new Promise((resolve, reject) => {
    user.authenticateUser(authDetails, {
      onSuccess: (session) => {
        localStorage.setItem('original_exp', session.getIdToken().getExpiration());
        resolve(session);
      },
      onFailure: (err) => {
        reject(err);
      },
    });
  });
};

export const signOut = () => {
  // Sign out the user from Cognito and clear localStorage
  // original_exp: Expiration time of the original token
  // cognitoToken: The Cognito token used for authentication
  
  const cognitoUser = userPool.getCurrentUser();
  if (cognitoUser) {
    return new Promise((resolve, reject) => {
      cognitoUser.signOut();
      localStorage.removeItem('original_exp');
      localStorage.removeItem('cognitoToken');
      resolve();
    });
  } else {
    return Promise.reject(new Error('No user is currently signed in'));
  }
};


function isTokenValid(token) {
  const expirationTime = localStorage.getItem('original_exp');
  if (!expirationTime) {
    console.error('No expiration time found in localStorage');
    return false;
  }
  const currentTime = Math.floor(Date.now() / 1000);
  const tokenExpirationTime = parseInt(expirationTime, 10);
  return currentTime < tokenExpirationTime;
}


export const checkSession = () => {
  const cognitoUser = userPool.getCurrentUser();

  return new Promise((resolve, reject) => {
    if (!cognitoUser) {
      reject(new Error('No user found'));
      return;
    }

    cognitoUser.getSession((err, session) => {
      console.log('Session check:', session.isValid(), session);
      if (!isTokenValid(session.getIdToken().getJwtToken())) {
        reject(new Error('Session expired'));
      } else {
        resolve(session);
      }
    });
  });
};
