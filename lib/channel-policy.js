const STANDARD_WINDOW_MS = 24 * 60 * 60 * 1000;
const META_CHANNELS = new Set(['instagram', 'messenger', 'facebook']);

// Called by any future platform adapter before attempting a send.
export function messagingEligibility({channel, doNotContact, lastInboundAt, recipientId, now = new Date()}) {
  if (doNotContact) return {allowed:false, reason:'opposition'};
  if (!META_CHANNELS.has(channel)) return {allowed:false, reason:'canal_non_connecte'};
  if (!recipientId) return {allowed:false, reason:'identifiant_plateforme_absent'};
  if (!lastInboundAt) return {allowed:false, reason:'conversation_non_initiee'};
  const elapsed = now.getTime() - new Date(lastInboundAt).getTime();
  if (!Number.isFinite(elapsed) || elapsed < 0 || elapsed >= STANDARD_WINDOW_MS)
    return {allowed:false, reason:'fenetre_24h_fermee'};
  return {allowed:true, reason:'reponse_a_message_entrant', expiresAt:new Date(new Date(lastInboundAt).getTime()+STANDARD_WINDOW_MS).toISOString()};
}
