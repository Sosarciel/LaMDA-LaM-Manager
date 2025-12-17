npm run compile
if ($LASTEXITCODE -ne 0) {
    Write-Error "编译失败, 停止发布"
    exit $LASTEXITCODE
}
Write-Output 开始发布
zcli bump
scripts/release-tag
