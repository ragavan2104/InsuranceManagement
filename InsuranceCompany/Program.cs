using FluentValidation;
using InsuranceCompany.Data;
using InsuranceCompany.Middlewares;
using InsuranceCompany.Repositories.Claims;
using InsuranceCompany.Repositories.Payments;
using InsuranceCompany.Repositories.PolicyManagement;
using InsuranceCompany.Repositories.Proposals;
using InsuranceCompany.Services.Authentication;
using InsuranceCompany.Services.Claims;
using InsuranceCompany.Services.Payments;
using InsuranceCompany.Services.PolicyManagement;
using InsuranceCompany.Services.Proposals;
using InsuranceCompany.Repositories.Users;
using InsuranceCompany.Services.Users;
using InsuranceCompany.Services.Communications;
using InsuranceCompany.Validators.Authentication;
using log4net;
using log4net.Config;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Initialize log4net right at startup
XmlConfigurator.Configure(new FileInfo("log4net.config"));
ILog _log = LogManager.GetLogger("Program");
_log.Info("Starting Vehicle Insurance API application...");

// Controllers & JSON configuration (Ignoring circular references)
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

// Fluent Validation
builder.Services.AddValidatorsFromAssemblyContaining<UserValidator>();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IPasswordHasher, PasswordHasher>();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IPolicyService, PolicyService>();
builder.Services.AddScoped<IPolicyRepository, PolicyRepository>(); 
builder.Services.AddScoped<IAddOnService, AddOnService>();
builder.Services.AddScoped<IAddOnRepository, AddOnRepository>();
builder.Services.AddScoped<IProposalService, ProposalService>();
builder.Services.AddScoped<IProposalRepository, ProposalRepository>();
builder.Services.AddScoped<IPaymentRepository, PaymentRepository>();
builder.Services.AddScoped<IPaymentService, PaymentService>();
builder.Services.AddScoped<IClaimRepository, ClaimRepository>();
builder.Services.AddScoped<IClaimService, ClaimService>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IEmailService, EmailService>();

// JWT Authentication Setup
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["JwtSettings:Issuer"],
            ValidAudience = builder.Configuration["JwtSettings:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["JwtSettings:SecretKey"]!))
        };
    });
builder.Services.AddAuthorization();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        builder =>
        {
            builder.WithOrigins("http://localhost:5173")
                   .AllowAnyMethod()
                   .AllowAnyHeader();
        });
});

// Swagger Documentation Generation
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo { Title = "Vehicle Insurance API", Version = "v1" });
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter your JWT token. Example: eyJhbGci..."
    });
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// Database Initialization / Startup Check
using (var scope = app.Services.CreateScope())
{
    try
    {
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        if (app.Configuration.GetValue<bool>("ApplyMigrationsOnStartup"))
        {
            _log.Info("ApplyMigrationsOnStartup is enabled. Checking/Applying database migrations...");
            int retries = 10;
            while (retries > 0)
            {
                try
                {
                    context.Database.Migrate();
                    _log.Info("Migrations applied successfully.");
                    break;
                }
                catch (Exception ex)
                {
                    retries--;
                    _log.Warn($"Database migration failed. Retrying in 5 seconds... ({retries} retries left)", ex);
                    if (retries == 0)
                    {
                        _log.Error("Database initialization failed after maximum retries.", ex);
                        throw;
                    }
                    System.Threading.Thread.Sleep(5000);
                }
            }
        }
        else
        {
            _log.Info("Database connection check successful.");
        }
    }
    catch (Exception ex)
    {
       
        _log.Error("Database initialization failed during application startup execution.", ex);
    }
}

// Middleware Pipeline Processing Engine
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseHttpsRedirection();
app.UseMiddleware<GlobalExceptionMiddleware>();
app.UseCors("AllowReactApp");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

_log.Info("Application initialized completely. Listening for web requests...");
app.Run();