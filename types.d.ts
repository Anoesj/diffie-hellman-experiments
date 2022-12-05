export type Prime = bigint;
export type PrivateKey = Prime;
export type PublicKey = bigint;
export type SharedSecret = bigint;
export type CommunicationParameters = {
  base: Prime;
  modulus: Prime;
};
