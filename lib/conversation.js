export function classifyMessage(input) {
  const text = (input || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[’']/g, ' ');
  const matches = patterns => patterns.some(pattern => pattern.test(text));
  if (matches([/\b(stop|unsubscribe|desabonn|leave me alone|do not contact|ne (me )?(re)?contacte|ne (me )?relance|pas interesse|non merci|no thanks|not interested)\b/])) return { intent: 'non', confidence: 0.98, review: false };
  if (matches([/\b(mlm|marketing de reseau|network marketing|pyramid|pyramide)\b/])) return { intent: 'mlm', confidence: 0.95, review: false };
  if (matches([/\b(mwr|travel advantage|quelle (societe|entreprise)|what company|which company|quel (club|groupe))\b/])) return { intent: 'societe', confidence: 0.94, review: false };
  if (matches([/\b(arnaque|scam|suspect|legit|fiable)\b/])) return { intent: 'suspicion', confidence: 0.85, review: true };
  if (matches([/\b(combien|prix|tarif|cout|price|cost|how much)\b/])) return { intent: 'prix', confidence: 0.9, review: true };
  if (matches([/\b(pas le temps|busy|no time|trop occupe)\b/])) return { intent: 'temps', confidence: 0.85, review: false };
  if (matches([/\b(oui|pourquoi pas|interesse|curieux|tell me more|interested|sounds good)\b/])) return { intent: 'curieux', confidence: 0.8, review: false };
  if (text.includes('?') || matches([/\b(quoi|comment|what|how|infos|information)\b/])) return { intent: 'info', confidence: 0.7, review: false };
  return { intent: 'ambigu', confidence: 0.3, review: true };
}

export function nextAction(prospect, lastInbound, now = new Date()) {
  if (!prospect || prospect.do_not_contact || prospect.status === 'refused') return null;
  if (!lastInbound) return { kind: 'manual_review', reason: 'Aucun échange reçu : vérifier le contexte avant de relancer.' };
  const result = classifyMessage(lastInbound.body);
  if (result.intent === 'non') return null;
  if (result.review) return { kind: 'manual_review', reason: 'Question sensible ou ambiguë : réponse humaine requise.' };
  if (result.intent === 'temps') return { kind: 'ask_permission', reason: 'Demander le moment souhaité avant de programmer une relance.' };
  return { kind: 'follow_up', dueAt: new Date(now.getTime() + 2 * 86400000).toISOString(), reason: 'Relance manuelle après intérêt exprimé.' };
}
