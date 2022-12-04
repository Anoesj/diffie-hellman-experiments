import { Communication } from './Communication.ts';
import { Actor } from './Actor.ts';
import { Interceptor } from './Interceptor.ts';

const tom = new Interceptor('Tom', 2);

const alice = new Actor('Alice', 3);
const bob = new Actor('Bob', 5);
const aliceBobCollaboration = new Communication(alice, bob, [tom]);

const exampleData = '<!doctype><html><head><title>Example</title></head><body><h1>Hello World</h1></body></html>';
await alice.sendData(exampleData, bob);
