$content = Get-Content "src/index.ts" -Raw
$content = $content -replace "import usersRoutes from './routes/users';", "import usersRoutes from './routes/users';`r`nimport teamEventRoutes from './routes/teamEvent.routes';"
$content = $content -replace "app.use\('/api/users', usersRoutes\);", "app.use('/api/users', usersRoutes);`r`napp.use('/api/events', teamEventRoutes);"
Set-Content "src/index.ts" $content -NoNewline
