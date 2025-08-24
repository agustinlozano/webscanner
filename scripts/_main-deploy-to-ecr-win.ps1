<#
.SYNOPSIS
  Build a Docker image and push to ECR (PowerShell native).

.DESCRIPTION
  This script builds the local Docker image, tags it for ECR and pushes it.
  Usage: .\scripts\_main-deploy-to-ecr-win.ps1 [-Tag <string>]
  If no -Tag is provided, the script defaults to 'latest'.

.NOTES
  - Requires AWS CLI configured and Docker Desktop running.
  - Tested for PowerShell (Windows PowerShell and PowerShell Core).

.USAGE
  .\scripts\_main-deploy-to-ecr-win.ps1 [-Tag <string>]
  If no -Tag is provided, the script defaults to 'latest'.
#>

param(
    [string]$Tag = "latest",
    [string]$AwsRegion = $(if ($env:AWS_REGION) { $env:AWS_REGION } else { 'us-east-2' }),
    [string]$EcrRepo = $(if ($env:ECR_REPOSITORY_NAME) { $env:ECR_REPOSITORY_NAME } else { 'daily-scraper-web-scraper' })
)

Set-StrictMode -Version Latest

Write-Host "ECR deploy starting" -ForegroundColor Green
Write-Host "  Repo:" $EcrRepo
Write-Host "  Region:" $AwsRegion
Write-Host "  Tag:" $Tag

function Fail([string]$msg, [int]$code = 1) {
    Write-Error $msg
    exit $code
}

if (-not (Get-Command aws -ErrorAction SilentlyContinue)) {
    Fail 'AWS CLI not found. Install and configure AWS CLI before running.' 2
}

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Fail 'Docker not found. Start Docker Desktop or install Docker.' 3
}

Write-Host "Retrieving AWS account ID..." -ForegroundColor Cyan
try {
    $AWS_ACCOUNT_ID = aws sts get-caller-identity --query Account --output text 2>$null
    if (-not $AWS_ACCOUNT_ID) { throw 'No account id returned' }
} catch {
    Fail "Failed to get AWS account id. Check AWS credentials and configuration." 4
}

Write-Host "  Account ID: $AWS_ACCOUNT_ID"

Write-Host "Ensuring ECR repository exists..." -ForegroundColor Cyan
try {
    aws ecr describe-repositories --repository-names $EcrRepo --region $AwsRegion > $null 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  Repository not found, creating: $EcrRepo"
        aws ecr create-repository --repository-name $EcrRepo --region $AwsRegion | Out-Null
    } else {
        Write-Host "  Repository exists: $EcrRepo"
    }
} catch {
    # If describe-repositories fails with non-zero exit code, try create
    try { aws ecr create-repository --repository-name $EcrRepo --region $AwsRegion | Out-Null } catch { }
}

$EcrRegistry = "${AWS_ACCOUNT_ID}.dkr.ecr.${AwsRegion}.amazonaws.com"

Write-Host "Authenticating Docker with ECR..." -ForegroundColor Yellow
try {
    aws ecr get-login-password --region $AwsRegion | docker login --username AWS --password-stdin "$EcrRegistry"
} catch {
    Fail "Docker login to ECR failed. Check AWS permissions and Docker daemon." 5
}

$LocalTag = "${EcrRepo}:${Tag}"
$EcrUri = "${EcrRegistry}/${EcrRepo}:${Tag}"

Write-Host "Building Docker image:" $LocalTag -ForegroundColor Magenta
try {
    docker build -t $LocalTag .
} catch {
    Fail "Docker build failed." 6
}

Write-Host "Tagging image for ECR:" $EcrUri -ForegroundColor Yellow
try {
    docker tag $LocalTag $EcrUri
} catch {
    Fail "Docker tag failed." 7
}

Write-Host "Pushing image to ECR:" $EcrUri -ForegroundColor Green
try {
    docker push $EcrUri
} catch {
    Fail "Docker push failed." 8
}

Write-Host "Push complete. Image URI:" $EcrUri -ForegroundColor Green

exit 0
