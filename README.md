Experimenting with how Diffie-Hellman key exchange works and how difficult it is to decrypt a message after intercepting the base, modulus and public keys in a MITM attack.

Run:
```bash
deno run index.ts
```

Work in progress. Also, I don't know a thing about cryptography, so please don't take this too seriously.

This script should output something like:
```
[Alice] I’m a new actor with private key: 3779n
[Bob] I’m a new actor with private key: 4049n
[Tom] I’m a new actor with private key: 3023n
Creating communication line between Alice and Bob. Interceptors: [ "Tom" ]
Actors agreed upon the following communication parameters: { base: 2689n, modulus: 2897n }
[Alice] Calculated public key: 1395n
[Bob] Calculated public key: 738n
[Tom] Intercepted key exchange data: {
  communicationParameters: { base: 2689n, modulus: 2897n },
  actor1PublicKey: 1395n,
  actor2PublicKey: 738n
}
[Tom] Determining possible private keys per actor: { possiblePrivateKeysActor1: [ 3779n ], possiblePrivateKeysActor2: [ 4049n ] }
[Tom] Calculated possible key combinations [ { sharedSecret: 640n, privateKeyActor1: 3779n, privateKeyActor2: 4049n } ]
[Alice] Added collaboration: {
  actor: Actor { name: "Bob" },
  publicKey: 738n,
  communication: Communication {
    actor1: Actor { name: "Alice" },
    actor2: Actor { name: "Bob" },
    actor1PublicKey: 1395n,
    actor2PublicKey: 738n,
    interceptors: [ Interceptor { name: "Tom", interceptedCommunications: [Map] } ],
    communicationParameters: { base: 2689n, modulus: 2897n }
  },
  sharedSecret: 640n
}
[Bob] Added collaboration: {
  actor: Actor { name: "Alice" },
  publicKey: 1395n,
  communication: Communication {
    actor1: Actor { name: "Alice" },
    actor2: Actor { name: "Bob" },
    actor1PublicKey: 1395n,
    actor2PublicKey: 738n,
    interceptors: [ Interceptor { name: "Tom", interceptedCommunications: [Map] } ],
    communicationParameters: { base: 2689n, modulus: 2897n }
  },
  sharedSecret: 640n
}
[Alice] Sending encrypted message to Bob: “Hi Bob! How are you?”
[Alice -> Bob] Transferring encrypted message
[Tom] Intercepted data: {
  receivingActor: Actor { name: "Bob" },
  sendingActor: Actor { name: "Alice" },
  encryptedData: "e6fea9f403dba12fb609e097964eba5f2c909a46f705728983c6fef998ea8cb8"
}
[Tom] Trying to decrypt message with possible key combination { sharedSecret: 640n, privateKeyActor1: 3779n, privateKeyActor2: 4049n }
[Tom] 😎 Cracket encryption of communication between Alice and Bob
[Tom] Decrypted message sent from Alice to Bob: “Hi Bob! How are you?”
[Bob] Received encrypted message from Alice
[Bob] Decrypted message from Alice: “Hi Bob! How are you?”
[Bob] Sending encrypted message to Alice: “Hey Alice, good good. Wanna chill?”
[Bob -> Alice] Transferring encrypted message
[Tom] Intercepted data: {
  receivingActor: Actor { name: "Alice" },
  sendingActor: Actor { name: "Bob" },
  encryptedData: "9eebd328a0fe2ae691412572719847da7653eb66191fe95b29e4aebace7aff23932a42fbaa5f5bf31973e4fb19ed7391"
}
[Tom] Decrypted message sent from Bob to Alice: “Hey Alice, good good. Wanna chill?”
[Alice] Received encrypted message from Bob
[Alice] Decrypted message from Bob: “Hey Alice, good good. Wanna chill?”
```