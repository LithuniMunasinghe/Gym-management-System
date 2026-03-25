using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using GymManagement.Models;

// ── Install these NuGet packages once ────────────────────────────────────────
//   PM> Install-Package System.IdentityModel.Tokens.Jwt
//   PM> Install-Package Microsoft.IdentityModel.Tokens
// ─────────────────────────────────────────────────────────────────────────────

namespace GymManagement.BusinessLayer
{
    public static class JwtHelper
    {
        // ── Read config values from Web.config <appSettings> ─────────────
        private static string Secret
            => System.Configuration.ConfigurationManager.AppSettings["JwtSecret"];

        private static string Issuer
            => System.Configuration.ConfigurationManager.AppSettings["JwtIssuer"];

        private static string Audience
            => System.Configuration.ConfigurationManager.AppSettings["JwtAudience"];

        private static int ExpiryMinutes
            => int.Parse(
                System.Configuration.ConfigurationManager.AppSettings["JwtExpiryMinutes"] ?? "1440");

        // ─────────────────────────────────────────────────────────────────
        //  GENERATE TOKEN
        //  Called by DAUser.Login and DAUser.OAuthLogin
        // ─────────────────────────────────────────────────────────────────
        public static string GenerateToken(UserModel user)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Secret));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.userId   ?? ""),
                new Claim(ClaimTypes.Name,           user.username ?? ""),
                new Claim(ClaimTypes.Email,          user.email    ?? ""),
                new Claim("roleId",                  user.roleId   ?? "3"),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            };

            var token = new JwtSecurityToken(
                issuer: Issuer,
                audience: Audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(ExpiryMinutes),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        // ─────────────────────────────────────────────────────────────────
        //  VALIDATE TOKEN
        //  Called by JwtAuthorizeAttribute on every protected request
        // ─────────────────────────────────────────────────────────────────
        public static ClaimsPrincipal ValidateToken(string token)
        {
            try
            {
                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Secret));
                var handler = new JwtSecurityTokenHandler();

                return handler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = key,
                    ValidateIssuer = true,
                    ValidIssuer = Issuer,
                    ValidateAudience = true,
                    ValidAudience = Audience,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero,   // no grace period
                }, out _);
            }
            catch
            {
                return null;    // invalid or expired token
            }
        }

        // ─────────────────────────────────────────────────────────────────
        //  CONVENIENCE: read userId from a token string
        // ─────────────────────────────────────────────────────────────────
        public static string GetUserIdFromToken(string token)
        {
            ClaimsPrincipal principal = ValidateToken(token);
            return principal?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        }
    }
}