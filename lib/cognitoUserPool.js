import { CognitoUserPool } from 'amazon-cognito-identity-js';

const poolData = {
  UserPoolId: 'us-east-2_36lyroXvt',
  ClientId: '5vme9agoobbsbrocuctilg2s6o',
};

const userPool = new CognitoUserPool(poolData);

export default userPool;
