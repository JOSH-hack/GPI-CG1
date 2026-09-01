#!/bin/bash

BASE_URL="http://localhost:8080/api"
EMAIL="joshbedel55@gmail.com"
PASSWORD="test1234"
COOKIE_JAR="cookies.txt"

# 1. Register
echo "=== 1. Register ==="
curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"nom\":\"Test\",\"prenom\":\"Cookie\",\"email\":\"$EMAIL\",\"motDePasse\":\"$PASSWORD\",\"role\":\"AGENT\"}" \
  | python3 -m json.tool
echo

# 2. Login AVANT verification (doit echouer en 400)
echo "=== 2. Login avant verification (attendu erreur) ==="
curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" \
  | python3 -m json.tool
echo

# 3. Verify Email - remplacez le code manuellement avant de lancer cette partie
read -p "Entrez le code recu par email : " CODE

echo "=== 3. Verify Email ==="
curl -s -X POST "$BASE_URL/auth/verify-email" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"code\":\"$CODE\"}" \
  | python3 -m json.tool
echo

# 4. Login APRES verification - sauvegarde le cookie dans cookies.txt
echo "=== 4. Login (pose le cookie) ==="
curl -s -X POST "$BASE_URL/auth/login" \
  -c "$COOKIE_JAR" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" \
  | python3 -m json.tool
echo

echo "Contenu du cookie jar :"
cat "$COOKIE_JAR"
echo

# 5. Me - envoie le cookie sauvegarde
echo "=== 5. Me (via cookie) ==="
curl -s -X GET "$BASE_URL/auth/me" \
  -b "$COOKIE_JAR" \
  | python3 -m json.tool
echo

# 6. Route protegee (exemple)
echo "=== 6. Dashboard stats ==="
curl -s -X GET "$BASE_URL/dashboard/stats" \
  -b "$COOKIE_JAR" \
  | python3 -m json.tool
echo

# 7. Logout - efface le cookie cote serveur
echo "=== 7. Logout ==="
curl -s -X POST "$BASE_URL/auth/logout" \
  -b "$COOKIE_JAR" -c "$COOKIE_JAR" \
  -w "Status: %{http_code}\n"
echo

# 8. Me APRES logout - doit echouer en 401/403
echo "=== 8. Me apres logout (attendu refus) ==="
curl -s -X GET "$BASE_URL/auth/me" \
  -b "$COOKIE_JAR" \
  -w "\nStatus: %{http_code}\n"
