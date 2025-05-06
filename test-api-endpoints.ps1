# PowerShell script to test API endpoints

# Define the function before using it
function Test-KnowledgeBase {
    param (
        [string]$Type,
        [string]$FileName
    )
    
    $endpoint = if ($Type -eq "Healthcare") {
        "http://localhost:3001/api/get-healthcare-knowledge-base?fileName=$FileName"
    } else {
        "http://localhost:3001/api/get-mba-knowledge-base?fileName=$FileName"
    }
    
    try {
        $response = Invoke-RestMethod -Uri $endpoint -Method Get -ErrorAction Stop
        
        Write-Host "Knowledge Base Success: $($response.success)"
        
        if ($response.success) {
            Write-Host "Knowledge base content retrieved successfully"
            if ($response.data.userInstructions) {
                Write-Host "User instructions found"
            }
        } else {
            Write-Host "Knowledge Base Error: $($response.error.message)"
        }
    } catch {
        Write-Host "Error testing $Type knowledge base: $_"
    }
}

Write-Host "Testing API endpoints..."
Write-Host "======================="
Write-Host ""

$endpoints = @(
    @{
        name = "Healthcare Instructions"
        url = "http://localhost:3001/api/get-healthcare-instructions"
    },
    @{
        name = "MBA Instructions"
        url = "http://localhost:3001/api/get-mba-instructions"
    }
)

foreach ($endpoint in $endpoints) {
    Write-Host "Testing $($endpoint.name)..."
    try {
        $response = Invoke-RestMethod -Uri $endpoint.url -Method Get -ErrorAction Stop
        
        Write-Host "Success: $($response.success)"
        
        if ($response.success) {
            if ($endpoint.name -eq "Healthcare Instructions") {
                Write-Host "Found $($response.data.instructions.length) healthcare instruction files"
                if ($response.data.instructions.length -gt 0) {
                    $sampleFile = $response.data.instructions[0].name
                    Write-Host "Testing healthcare knowledge base with sample file: $sampleFile"
                    Test-KnowledgeBase -Type "Healthcare" -FileName $sampleFile
                }
            } elseif ($endpoint.name -eq "MBA Instructions") {
                Write-Host "Found $($response.data.instructions.length) MBA instruction files"
                if ($response.data.instructions.length -gt 0) {
                    $sampleFile = $response.data.instructions[0].name
                    Write-Host "Testing MBA knowledge base with sample file: $sampleFile"
                    Test-KnowledgeBase -Type "MBA" -FileName $sampleFile
                }
            }
        } else {
            Write-Host "Error: $($response.error.message)"
        }
    } catch {
        Write-Host "Error testing $($endpoint.name): $_"
    }
    Write-Host ""
}
