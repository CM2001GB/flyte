FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ApiGateway.csproj ./
RUN dotnet restore

COPY . ./
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
# Override ocelot.json with Docker-specific config (container names instead of localhost)
# if trying to push to azure, comment out docker and activate azure and if trying to use
# local docker, comment out azure and activate docker
COPY ocelot.docker.json /app/ocelot.json
# COPY ocelot.azure.json /app/ocelot.json

EXPOSE 7000

ENTRYPOINT ["dotnet", "ApiGateway.dll"]