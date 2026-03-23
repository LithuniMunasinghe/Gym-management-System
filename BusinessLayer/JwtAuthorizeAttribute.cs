using System;
using System.Linq;
using System.Web.Mvc;

// ── How to use ────────────────────────────────────────────────────────────────
//
//   Any authenticated user:
//     [JwtAuthorize]
//
//   Admin only (roleId = 1):
//     [JwtAuthorize(Roles = "1")]
//
//   Admin or Trainer (roleId = 1 or 2):
//     [JwtAuthorize(Roles = "1,2")]
//
//   The validated ClaimsPrincipal is stored in HttpContext.Items["JwtPrincipal"]
//   so you can read claims inside the controller action if needed.
// ─────────────────────────────────────────────────────────────────────────────

namespace WebApplication1.BusinessLayer
{
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = false)]
    public class JwtAuthorizeAttribute : ActionFilterAttribute
    {
        /// <summary>
        /// Comma-separated roleId values allowed to call this action.
        /// Leave empty to allow any authenticated user.
        /// Example: Roles = "1"  or  Roles = "1,2"
        /// </summary>
        public string Roles { get; set; }

        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            var request = filterContext.HttpContext.Request;

            // ── Step 1: Read the Authorization header ─────────────────────
            string authHeader = request.Headers["Authorization"];

            if (string.IsNullOrWhiteSpace(authHeader) ||
                !authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            {
                filterContext.Result = JsonError(401, "Missing or invalid Authorization header.");
                return;
            }

            string token = authHeader.Substring(7).Trim();

            // ── Step 2: Validate the JWT ──────────────────────────────────
            var principal = JwtHelper.ValidateToken(token);
            if (principal == null)
            {
                filterContext.Result = JsonError(401, "Token is invalid or has expired. Please log in again.");
                return;
            }

            // ── Step 3: Check role if specified ───────────────────────────
            if (!string.IsNullOrWhiteSpace(Roles))
            {
                var allowedRoles = Roles.Split(',').Select(r => r.Trim());
                var userRole = principal.FindFirst("roleId")?.Value ?? "";

                if (!allowedRoles.Contains(userRole))
                {
                    filterContext.Result = JsonError(403, "You do not have permission to perform this action.");
                    return;
                }
            }

            // ── Step 4: Store principal for use inside the controller ─────
            filterContext.HttpContext.Items["JwtPrincipal"] = principal;

            base.OnActionExecuting(filterContext);
        }

        // ── Helper — returns a JSON error result ──────────────────────────
        private static JsonResult JsonError(int statusCode, string message)
            => new JsonResult
            {
                Data = new { StatusCode = statusCode, Message = message },
                JsonRequestBehavior = JsonRequestBehavior.AllowGet,
            };
    }
}