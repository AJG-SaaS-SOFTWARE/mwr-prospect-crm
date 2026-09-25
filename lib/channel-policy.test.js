import test from 'node:test';
import assert from 'node:assert/strict';
import {messagingEligibility} from './channel-policy.js';

const now=new Date('2026-09-25T18:00:00Z');
const base={channel:'instagram',recipientId:'ig-scoped-id',lastInboundAt:'2026-09-25T17:00:00Z',now};
test('le premier DM automatisé à froid est bloqué',()=>{
 assert.equal(messagingEligibility({...base,lastInboundAt:null}).reason,'conversation_non_initiee');
});
test('opposition prioritaire et fenêtre de 24 heures stricte',()=>{
 assert.equal(messagingEligibility({...base,doNotContact:true}).reason,'opposition');
 assert.equal(messagingEligibility({...base,lastInboundAt:'2026-09-24T18:00:00Z'}).reason,'fenetre_24h_fermee');
 assert.equal(messagingEligibility(base).allowed,true);
});
test('identifiant de plateforme et canal officiellement connecté requis',()=>{
 assert.equal(messagingEligibility({...base,recipientId:''}).allowed,false);
 assert.equal(messagingEligibility({...base,channel:'linkedin'}).allowed,false);
});
