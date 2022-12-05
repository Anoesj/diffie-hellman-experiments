import { Communication } from './Communication.ts';
import { Actor } from './Actor.ts';
import { Interceptor } from './Interceptor.ts';
import { getRandomPrime } from './data.ts';

const alice = new Actor('Alice', getRandomPrime());
const bob = new Actor('Bob', getRandomPrime());

const tom = new Interceptor('Tom', getRandomPrime());

new Communication(alice, bob, [tom]);

await alice.sendData('Hi Bob! How are you?', bob);
await bob.sendData('Hey Alice, good good. Wanna chill?', alice);
