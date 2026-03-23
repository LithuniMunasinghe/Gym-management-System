using GymManagement.Models;

namespace GymManagement.Interfaces
{
    public interface IUser
    {
        // ── Existing CRUD ─────────────────────────────────────────────────
        bool IsAdmin(string userId);
        Response GetAllUsers();
        Response SelectById(int userId);
        Response EditUserById(UserModel user, string adminId);
        Response DeleteUserById(int id, string adminId);
        Response AddUser(UserModel user, string adminId);

        // ── Auth — Login & OAuth ──────────────────────────────────────────
        /// <summary>
        /// Standard login. Returns { user, token } inside Data on success.
        /// </summary>
        Response Login(string username, string password);

        /// <summary>
        /// Google / Facebook login. Creates account on first use.
        /// Returns { user, token } inside Data on success.
        /// </summary>
        Response OAuthLogin(string providerName, string providerUserId,
                            string email, string name);

        // ── Forgot Password (3 steps) ─────────────────────────────────────
        /// <summary>Step 1 — generates 6-digit OTP and emails it.</summary>
        Response RequestPasswordReset(string email);

        /// <summary>Step 2 — verifies the OTP without changing password.</summary>
        Response VerifyResetCode(string email, string code);

        /// <summary>Step 3 — verifies OTP then updates password hash.</summary>
        Response ResetPassword(string email, string code, string newPasswordHash);
    }
}