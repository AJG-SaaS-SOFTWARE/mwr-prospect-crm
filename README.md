# MWR Prospect CRM

Prototype CRM de prospection multicanal responsable pour une activité autour du voyage.

## Principes
- curiosité et invitation courte tant qu'aucune question précise n'est posée ;
- transparence immédiate sur MWR Life, Travel Advantage et le modèle MLM lorsqu'un prospect le demande ;
- aucune promesse de revenus ni information inventée ;
- opposition = arrêt des relances ;
- automatisation uniquement via les possibilités officielles des plateformes.

## Démarrage
`npm install && npm run dev`

## Architecture V1
- Dashboard et pipeline
- Prospects multicanaux
- Bibliothèque de scripts par canal
- Conversations et classification d'intention
- Règles de transparence prioritaires
- Modules Présentations, Relances et Analytics préparés

## Règles conversationnelles
1. Ne jamais inventer d'information ni promettre de revenus.
2. Si le prospect demande la société, répondre MWR Life.
3. Si le prospect demande le club, répondre Travel Advantage.
4. Si le prospect demande si c'est du MLM/marketing de réseau, répondre clairement oui pour la partie opportunité.
5. Si le prospect refuse ou demande l'arrêt, passer en opposition et ne plus relancer.
6. Ne pas utiliser d'automatisation non autorisée par les plateformes.
