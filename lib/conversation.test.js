import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyMessage, nextAction } from './conversation.js';

test('opposition prioritaire même avec une question de prix', () => {
  assert.equal(classifyMessage('Non merci, ne me recontacte pas. Combien ça coûte ?').intent, 'non');
  assert.equal(classifyMessage('Please do not contact me').intent, 'non');
  assert.equal(nextAction({ do_not_contact: true }, { body: 'oui' }), null);
});
test('transparence et escalade', () => {
  assert.equal(classifyMessage('Est-ce un MLM ?').intent, 'mlm');
  assert.equal(classifyMessage('Quelle société ?').intent, 'societe');
  assert.equal(classifyMessage('Est-ce une arnaque ?').review, true);
  assert.equal(nextAction({status:'curious'}, {body:'Combien ça coûte ?'}).kind, 'manual_review');
});
test('relance subordonnée au dernier message entrant', () => {
  assert.equal(nextAction({status:'curious'}, {body:'Oui, intéressé'}, new Date('2026-09-25T12:00:00Z')).dueAt, '2026-09-27T12:00:00.000Z');
  assert.equal(nextAction({status:'curious'}, {body:'Pas le temps'}).kind, 'ask_permission');
  assert.equal(classifyMessage('Je ne suis pas intéressé').intent, 'non');
});
