#!/bin/bash

# 🧪 Script de prueba para consultar usuarios y salas
# Asegúrate de que el servidor esté corriendo en http://localhost:3333

BASE_URL="http://localhost:3333"

echo "🔍 =========================================="
echo "   CONSULTA DE USUARIOS Y SALAS"
echo "=========================================="
echo ""

# Función para hacer peticiones y mostrar resultado
function query() {
  local endpoint=$1
  local title=$2
  
  echo "📡 $title"
  echo "   GET $BASE_URL$endpoint"
  echo ""
  
  response=$(curl -s "$BASE_URL$endpoint")
  
  if command -v jq &> /dev/null; then
    echo "$response" | jq '.'
  else
    echo "$response"
  fi
  
  echo ""
  echo "-------------------------------------------"
  echo ""
}

# 1. Obtener usuarios conectados
query "/api/sockets" "1️⃣  USUARIOS CONECTADOS"

# 2. Obtener salas activas
query "/api/rooms" "2️⃣  SALAS ACTIVAS"

# 3. Obtener miembros de sala "admins" (si existe)
query "/api/rooms/admins/members" "3️⃣  MIEMBROS DE SALA 'admins'"

# 4. Health check
query "/health" "4️⃣  HEALTH CHECK"

echo "✅ Consultas completadas"
echo ""
echo "💡 Tips:"
echo "   - Abre test-client.html para agregar usuarios"
echo "   - Únete a salas usando el cliente"
echo "   - Vuelve a ejecutar este script para ver cambios"
echo ""
