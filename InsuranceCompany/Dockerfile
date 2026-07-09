FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy csproj and restore as distinct layers
COPY ["InsuranceCompany.csproj", "./"]
RUN dotnet restore "InsuranceCompany.csproj"

# Copy everything else and build
COPY . .
RUN dotnet build "InsuranceCompany.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "InsuranceCompany.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .

EXPOSE 5260
ENV ASPNETCORE_URLS=http://+:5260
ENV ASPNETCORE_ENVIRONMENT=Production

ENTRYPOINT ["dotnet", "InsuranceCompany.dll"]
