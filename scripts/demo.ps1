$ErrorActionPreference = "Stop"
$API = if ($env:API) { $env:API } else { "http://localhost:8080" }
$KEY = if ($env:IDEMGATE_API_KEY) { $env:IDEMGATE_API_KEY } else { "dev-secret-change-me" }
$FP = if ($env:FP) { $env:FP } else { "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855" }
$headers = @{ "X-Api-Key" = $KEY; "Content-Type" = "application/json" }

Write-Host "== Health =="
Invoke-RestMethod "$API/actuator/health"

Write-Host "== Double-click: first claim =="
$r1 = Invoke-RestMethod -Method Post -Uri "$API/v1/operations/claim" -Headers $headers -Body (@{
  scope = "demo"; key = "script-double"; fingerprint = $FP; ttlSeconds = 300
} | ConvertTo-Json)
$r1 | ConvertTo-Json -Compress

Write-Host "== Double-click: second claim =="
$r2 = Invoke-RestMethod -Method Post -Uri "$API/v1/operations/claim" -Headers $headers -Body (@{
  scope = "demo"; key = "script-double"; fingerprint = $FP; ttlSeconds = 300
} | ConvertTo-Json)
$r2 | ConvertTo-Json -Compress

Write-Host "== Complete $($r1.operationId) =="
Invoke-RestMethod -Method Post -Uri "$API/v1/operations/$($r1.operationId)/complete" -Headers $headers -Body (@{
  status = "COMPLETED"; responseStatus = 200; responseBody = '{"ok":true}'
} | ConvertTo-Json) | ConvertTo-Json -Compress

Write-Host "== Replay after complete =="
Invoke-RestMethod -Method Post -Uri "$API/v1/operations/claim" -Headers $headers -Body (@{
  scope = "demo"; key = "script-double"; fingerprint = $FP
} | ConvertTo-Json) | ConvertTo-Json -Compress

Write-Host "== UNKNOWN crash path =="
$r3 = Invoke-RestMethod -Method Post -Uri "$API/v1/operations/claim" -Headers $headers -Body (@{
  scope = "demo"; key = "script-crash"; fingerprint = $FP
} | ConvertTo-Json)
Invoke-RestMethod -Method Post -Uri "$API/v1/operations/$($r3.operationId)/complete" -Headers $headers -Body (@{
  status = "UNKNOWN"; responseStatus = 500; responseBody = '{"reason":"crash"}'
} | ConvertTo-Json) | ConvertTo-Json -Compress

Write-Host "Demo finished."
