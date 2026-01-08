# 🔍 Script de Prueba - Usuarios y Salas (PowerShell)
# Ejecutar: .\test-api.ps1

$BASE_URL = "http://localhost:3333"

Write-Host "🔍 ==========================================" -ForegroundColor Cyan
Write-Host "   CONSULTA DE USUARIOS Y SALAS" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

function Query-Endpoint {
    param(
        [string]$Endpoint,
        [string]$Title
    )
    
    Write-Host "📡 $Title" -ForegroundColor Yellow
    Write-Host "   GET $BASE_URL$Endpoint" -ForegroundColor Gray
    Write-Host ""
    
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL$Endpoint" -Method Get
        $response | ConvertTo-Json -Depth 10
    }
    catch {
        Write-Host "❌ Error: $_" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "-------------------------------------------" -ForegroundColor Gray
    Write-Host ""
}

# 1. Obtener usuarios conectados
Query-Endpoint -Endpoint "/api/sockets" -Title "1️⃣  USUARIOS CONECTADOS"

# 2. Obtener salas activas
Query-Endpoint -Endpoint "/api/rooms" -Title "2️⃣  SALAS ACTIVAS"

# 3. Obtener miembros de sala "admins" (si existe)
Query-Endpoint -Endpoint "/api/rooms/admins/members" -Title "3️⃣  MIEMBROS DE SALA 'admins'"

# 4. Health check
Query-Endpoint -Endpoint "/health" -Title "4️⃣  HEALTH CHECK"

Write-Host "✅ Consultas completadas" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Tips:" -ForegroundColor Cyan
Write-Host "   - Abre test-client.html para agregar usuarios"
Write-Host "   - Únete a salas usando el cliente"
Write-Host "   - Vuelve a ejecutar este script para ver cambios"
Write-Host ""
