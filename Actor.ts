import { encryptData, decryptData } from './crypto.ts';
import type { CommunicationParameters, Prime, PublicKey, SharedSecret } from './types.d.ts';

export class Actor {

  name: string;

  #privateKey: Prime;

  #collaborations: {
    actor: Actor;
    publicKey: PublicKey;
    sharedSecret: SharedSecret;
  }[] = [];

  constructor (name: string, privateKey: Prime) {
    this.name = name;
    this.#privateKey = privateKey;
  }

  log (msg: string, ...args: unknown[]) {
    console.log(`[${this.name}] ${msg}`, ...args);
  }

  calculatePublicKey (communicationParameters: CommunicationParameters) {
    return communicationParameters.base ** this.#privateKey % communicationParameters.modulus;
  }

  addCollaboration (actor: Actor, actorPublicKey: PublicKey, communicationParameters: CommunicationParameters) {
    this.#collaborations.push({
      actor,
      publicKey: actorPublicKey,
      sharedSecret: this.calculateSharedSecret(actorPublicKey, communicationParameters),
    });
  }

  calculateSharedSecret (actorPublicKey: PublicKey, communicationParameters: CommunicationParameters) {
    const sharedSecret = actorPublicKey ** this.#privateKey % communicationParameters.modulus;
    this.log('Calculated shared secret:', sharedSecret);
    return sharedSecret;
  }

  async sendData (data: string, actor: Actor) {
    this.log(`Sending data to ${actor.name}:`, data);
    const collaboration = this.#collaborations.find(collaboration => collaboration.actor === actor)!;
    const { sharedSecret } = collaboration;
    const encryptedData = await encryptData(data, sharedSecret);
    await actor.receiveData(encryptedData, this);
  }

  async receiveData (encryptedData: string, actor: Actor) {
    this.log(`Received encrypted data from ${actor.name}:`, encryptedData);
    const collaboration = this.#collaborations.find(collaboration => collaboration.actor === actor)!;
    const { sharedSecret } = collaboration;
    const data = await decryptData(encryptedData, sharedSecret);
    return data;
  }

}