LIVE AVEC CONSENTEMENT — projet de démonstration

Fonctions:
- Partage caméra + microphone après clic explicite « Accepter et démarrer » et autorisations du navigateur.
- Chat texte à l'intérieur de l'application.
- Bouton quitter qui coupe les pistes locales.
- Aucun accès aux SMS, notifications ou contacts du téléphone.

Installation:
1. Installer Node.js (version LTS) sur un ordinateur.
2. Décompresser ce dossier.
3. Dans le dossier, ouvrir un terminal et exécuter: npm install
4. Puis: npm start
5. Ouvrir http://localhost:3000 pour les tests sur le même ordinateur.

Pour deux appareils distants:
- Déployer le serveur sur un hébergement prenant en charge Node.js et Socket.IO.
- Le site doit être HTTPS pour caméra/micro sur les appareils mobiles.
- Partager un code de salon. Les deux participants choisissent le même code, un « Voir le live », l’autre « Partager caméra + micro ».
- Le partage ne démarre que lorsque le participant caméra accepte le prompt.

Limites:
- Ceci est un prototype éducatif, non audité, sans authentification ni chiffrement applicatif du chat.
- STUN seul ne garantit pas la connexion sur tous les réseaux; une configuration TURN peut être nécessaire.
- Ne pas utiliser pour filmer quelqu'un sans son consentement explicite.
