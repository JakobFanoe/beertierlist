# Beer Tierlist

The React app uses the `services.beertierlist` ASP.NET Core API for authentication, tierlist images, and spin-wheel options. Images are stored by the backend in Azure Blob Storage; the frontend does not connect to Firebase.

## Local development

The frontend's `.env.development` points to the local API. The backend's Development settings provide the local CORS origin and a development-only JWT key. Local setup only requires your SQL Server and Azure Blob Storage connection strings in the launch profile.

```powershell
Set-Location ..\services.beertierlist
if (-not (Test-Path services.beertierlist.api\Properties\launchSettings.json)) {
  Copy-Item services.beertierlist.api\Properties\launchSettings.example.json services.beertierlist.api\Properties\launchSettings.json
}
```

Fill only `ConnectionStrings:Database` and `ConnectionStrings:Blobstorage` in the local `launchSettings.json`. That file is git-ignored; never commit connection strings. Run the API from the backend repository:

```powershell
dotnet run --project services.beertierlist.api\services.beertierlist.api.csproj --launch-profile https
```

In a separate terminal, run the frontend from `app` with `npm start`. Production builds must set `REACT_APP_API_BASE_URL`; no localhost API URL is used in production.

For deployment, provide `Cors__AllowedOrigins__0`, `Jwt__Issuer`, `Jwt__Audience`, `Jwt__Key`, `ConnectionStrings__Database`, and `ConnectionStrings__Blobstorage` through environment variables or your secret/configuration store; configure `REACT_APP_API_BASE_URL` at frontend build time. Add more CORS origins using subsequent indexes. At least one origin is required, and no local CORS, JWT, database, or storage fallback is used outside Development.

After adding the connection strings, apply the migrations from the backend repository root:

```powershell
dotnet ef database update --project services.beertierlist.infrastructure\services.beertierlist.infrastructure.csproj --startup-project services.beertierlist.api\services.beertierlist.api.csproj
```

For manual SQL Server setup, run the scripts in `services.beertierlist.infrastructure\Persistence\Migrations\Scripts` in timestamp order. The scripts cover the initial schema, ASP.NET Identity, and the Firebase replacement migration.

Run the API using the Development launch profile, then start the frontend from `app` with `npm start`. Refresh sessions use a secure, HttpOnly cookie, so deployments must serve the API over HTTPS.

New accounts use a username and a password of at least 12 characters. Existing Firebase accounts, tierlist entries, images, and wheel options are not migrated.

## OpenAPI client generation

The generated NSwag TypeScript client is checked in at `app\src\services\api\generatedClient.ts`. Start the backend in Development so its OpenAPI document is available at `/openapi/v1.json`, then regenerate the client:

```powershell
Set-Location app
npm run generate:api
```

The NSwag local tool manifest is `services.beertierlist\dotnet-tools.json`; run `dotnet tool restore` in that repository after cloning. Set `REACT_APP_API_BASE_URL` or pass `-ApiBaseUrl` to `app\scripts\generate-api-client.ps1` to choose the backend whose OpenAPI document will generate the client.

Run `npm test` and `npm run build` from `app` to verify the frontend.
