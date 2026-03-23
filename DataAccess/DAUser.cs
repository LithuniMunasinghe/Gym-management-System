using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using GymManagement.BusinessLayer;
using GymManagement.Interfaces;
using GymManagement.Models;
using GymManagement.Database_Layer;

namespace GymManagement.DataAccess
{
    public class DAUser : IUser
    {
        // ═══════════════════════════════════════════════════════════════════
        //  GET ALL USERS
        // ═══════════════════════════════════════════════════════════════════
        public Response GetAllUsers()
        {
            Response res = new Response();
            var userList = new List<UserModel>();

            string query = @"
                SELECT userId, username, email, phone,
                       created_date, created_by,
                       updated_date, updated_by,
                       status, roleId
                FROM [dbo].[User]";

            using (DBconnect db = new DBconnect())
            using (SqlDataReader reader = db.ReadTable(query))
            {
                while (reader.Read())
                    userList.Add(MapUser(reader));
            }

            res.StatusCode = 200;
            res.ResultList = userList;
            res.Message = "Success";
            return res;
        }

        // ═══════════════════════════════════════════════════════════════════
        //  SELECT BY ID
        // ═══════════════════════════════════════════════════════════════════
        public Response SelectById(int userId)
        {
            Response res = new Response();

            string query = @"
                SELECT userId, username, email, phone, status, roleId
                FROM [dbo].[User]
                WHERE userId = @id";

            using (DBconnect db = new DBconnect())
            using (SqlCommand cmd = new SqlCommand(query, db.GetOpenConnection()))
            {
                cmd.Parameters.AddWithValue("@id", userId);

                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    if (reader.Read())
                    {
                        res.StatusCode = 200;
                        res.Data = MapUser(reader);
                    }
                    else
                    {
                        res.StatusCode = 404;
                        res.Message = "User not found";
                    }
                }
            }
            return res;
        }

        // ═══════════════════════════════════════════════════════════════════
        //  DELETE USER  (soft delete — sets status = 'Deleted')
        // ═══════════════════════════════════════════════════════════════════
        public Response DeleteUserById(int id, string adminId)
        {
            Response res = new Response();

            string query = @"
                UPDATE [dbo].[User]
                SET    status       = 'Deleted',
                       updated_date = GETDATE(),
                       updated_by   = @admin
                WHERE  userId = @id";

            using (DBconnect db = new DBconnect())
            using (SqlCommand cmd = new SqlCommand(query, db.GetOpenConnection()))
            {
                cmd.Parameters.AddWithValue("@id", id);
                cmd.Parameters.AddWithValue("@admin", Convert.ToInt32(adminId));

                int rows = cmd.ExecuteNonQuery();
                res.StatusCode = rows > 0 ? 200 : 400;
                res.Message = rows > 0 ? "User marked as deleted" : "Delete failed";
            }
            return res;
        }

        // ═══════════════════════════════════════════════════════════════════
        //  ADD USER
        // ═══════════════════════════════════════════════════════════════════
        public Response AddUser(UserModel user, string adminId)
        {
            Response res = new Response();

            string query = @"
                INSERT INTO [dbo].[User]
                    (username, email, phone, password_hash, status, roleId,
                     created_date, created_by, updated_date, updated_by)
                VALUES
                    (@un, @em, @ph, @pw, 'Active', @rid,
                     GETDATE(), @admin, GETDATE(), @admin)";

            using (DBconnect db = new DBconnect())
            using (SqlCommand cmd = new SqlCommand(query, db.GetOpenConnection()))
            {
                cmd.Parameters.AddWithValue("@un", user.username);
                cmd.Parameters.AddWithValue("@em", user.email);
                cmd.Parameters.AddWithValue("@ph", user.phone ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@pw", user.password_hash);
                cmd.Parameters.AddWithValue("@rid", user.roleId);
                cmd.Parameters.AddWithValue("@admin", Convert.ToInt32(adminId));

                int rows = cmd.ExecuteNonQuery();
                res.StatusCode = rows > 0 ? 200 : 400;
                res.Message = rows > 0 ? "User Added" : "Failed";
            }
            return res;
        }

        // ═══════════════════════════════════════════════════════════════════
        //  EDIT USER
        // ═══════════════════════════════════════════════════════════════════
        public Response EditUserById(UserModel user, string adminId)
        {
            Response res = new Response();

            string query = @"
                UPDATE [dbo].[User]
                SET    username     = @un,
                       email        = @em,
                       phone        = @ph,
                       updated_date = GETDATE(),
                       updated_by   = @admin
                WHERE  userId = @id";

            using (DBconnect db = new DBconnect())
            using (SqlCommand cmd = new SqlCommand(query, db.GetOpenConnection()))
            {
                cmd.Parameters.AddWithValue("@id", user.userId);
                cmd.Parameters.AddWithValue("@un", user.username);
                cmd.Parameters.AddWithValue("@em", user.email);
                cmd.Parameters.AddWithValue("@ph", user.phone ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@admin", Convert.ToInt32(adminId));

                int rows = cmd.ExecuteNonQuery();
                res.StatusCode = rows > 0 ? 200 : 400;
                res.Message = rows > 0 ? "User Updated Successfully" : "Update Failed";
            }
            return res;
        }

        // ═══════════════════════════════════════════════════════════════════
        //  IS ADMIN
        // ═══════════════════════════════════════════════════════════════════
        public bool IsAdmin(string userId)
        {
            string query = @"
                SELECT COUNT(*)
                FROM   [dbo].[User]
                WHERE  userId = @uid AND roleId = 1";

            using (DBconnect db = new DBconnect())
            using (SqlCommand cmd = new SqlCommand(query, db.GetOpenConnection()))
            {
                cmd.Parameters.AddWithValue("@uid", userId);
                return (int)cmd.ExecuteScalar() > 0;
            }
        }

        // ═══════════════════════════════════════════════════════════════════
        //  LOGIN  —  returns { user, token } on success
        // ═══════════════════════════════════════════════════════════════════
        public Response Login(string username, string password)
        {
            Response res = new Response();

            string query = @"
                SELECT userId, username, email, phone, status, roleId
                FROM   [dbo].[User]
                WHERE  username      = @username
                  AND  password_hash = @password
                  AND  status       != 'Deleted'";

            using (DBconnect db = new DBconnect())
            using (SqlCommand cmd = new SqlCommand(query, db.GetOpenConnection()))
            {
                cmd.Parameters.AddWithValue("@username", username);
                cmd.Parameters.AddWithValue("@password", password);

                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    if (reader.Read())
                    {
                        UserModel user = MapUser(reader);
                        string token = JwtHelper.GenerateToken(user);

                        res.StatusCode = 200;
                        res.Data = new { user, token };
                        res.Message = "Login successful";
                    }
                    else
                    {
                        res.StatusCode = 401;
                        res.Message = "Invalid username or password";
                    }
                }
            }
            return res;
        }

        // ═══════════════════════════════════════════════════════════════════
        //  OAUTH LOGIN — Google / Facebook
        //
        //  Requires table [dbo].[UserOAuth]  → run SQL/Migration_Auth.sql
        // ═══════════════════════════════════════════════════════════════════
        public Response OAuthLogin(string providerName, string providerUserId,
                                   string email, string name)
        {
            Response res = new Response();

            using (DBconnect db = new DBconnect())
            {
                SqlConnection conn = db.GetOpenConnection();

                // ── 1. Check if this OAuth account is already linked ──────
                int? linkedUserId = null;

                using (SqlCommand cmd = new SqlCommand(@"
                    SELECT userId FROM [dbo].[UserOAuth]
                    WHERE  provider       = @prov
                      AND  providerUserId = @pid", conn))
                {
                    cmd.Parameters.AddWithValue("@prov", providerName.ToLower());
                    cmd.Parameters.AddWithValue("@pid", providerUserId);
                    object scalar = cmd.ExecuteScalar();
                    if (scalar != null) linkedUserId = Convert.ToInt32(scalar);
                }

                int userId;

                if (linkedUserId.HasValue)
                {
                    // Already registered via OAuth — just use the existing userId
                    userId = linkedUserId.Value;
                }
                else
                {
                    // ── 2. Check if a [User] row exists for this email ────
                    int? existingUserId = null;

                    using (SqlCommand cmd = new SqlCommand(@"
                        SELECT userId FROM [dbo].[User]
                        WHERE  email  = @em
                          AND  status != 'Deleted'", conn))
                    {
                        cmd.Parameters.AddWithValue("@em", email);
                        object scalar = cmd.ExecuteScalar();
                        if (scalar != null) existingUserId = Convert.ToInt32(scalar);
                    }

                    if (existingUserId.HasValue)
                    {
                        userId = existingUserId.Value;
                    }
                    else
                    {
                        // ── 3. Create brand-new User (roleId 3 = Member) ──
                        // Your database trigger (trg_AfterUserInsert_MultiRole)
                        // will automatically insert into Member table.
                        string safeName = (name ?? email.Split('@')[0]).Replace(" ", "_");

                        using (SqlCommand cmd = new SqlCommand(@"
                            INSERT INTO [dbo].[User]
                                (username, email, password_hash, status, roleId,
                                 created_date, created_by, updated_date, updated_by)
                            VALUES
                                (@un, @em, '', 'Active', 3,
                                 GETDATE(), 0, GETDATE(), 0);
                            SELECT SCOPE_IDENTITY();", conn))
                        {
                            cmd.Parameters.AddWithValue("@un", safeName);
                            cmd.Parameters.AddWithValue("@em", email);
                            userId = Convert.ToInt32(cmd.ExecuteScalar());
                        }
                    }

                    // ── 4. Link OAuth provider to this userId ─────────────
                    using (SqlCommand cmd = new SqlCommand(@"
                        INSERT INTO [dbo].[UserOAuth]
                            (userId, provider, providerUserId)
                        VALUES
                            (@uid, @prov, @pid)", conn))
                    {
                        cmd.Parameters.AddWithValue("@uid", userId);
                        cmd.Parameters.AddWithValue("@prov", providerName.ToLower());
                        cmd.Parameters.AddWithValue("@pid", providerUserId);
                        cmd.ExecuteNonQuery();
                    }
                }

                // ── 5. Load full user row and issue JWT ───────────────────
                UserModel user = null;

                using (SqlCommand cmd = new SqlCommand(@"
                    SELECT userId, username, email, phone, status, roleId
                    FROM   [dbo].[User]
                    WHERE  userId = @uid", conn))
                {
                    cmd.Parameters.AddWithValue("@uid", userId);
                    using (SqlDataReader reader = cmd.ExecuteReader())
                        if (reader.Read()) user = MapUser(reader);
                }

                if (user == null)
                {
                    res.StatusCode = 500;
                    res.Message = "OAuth login failed — could not load user record.";
                    return res;
                }

                string token = JwtHelper.GenerateToken(user);
                res.StatusCode = 200;
                res.Data = new { user, token };
                res.Message = "OAuth login successful";
            }
            return res;
        }

        // ═══════════════════════════════════════════════════════════════════
        //  FORGOT PASSWORD — Step 1: Send OTP email
        //
        //  Requires table [dbo].[PasswordResetCodes]  → run SQL/Migration_Auth.sql
        // ═══════════════════════════════════════════════════════════════════
        public Response RequestPasswordReset(string email)
        {
            Response res = new Response();

            // Always return the same message to prevent email enumeration
            const string safeMsg = "If that email is registered, a reset code has been sent.";

            // ── 1. Check the email exists ─────────────────────────────────
            string username = null;

            using (DBconnect db = new DBconnect())
            using (SqlCommand cmd = new SqlCommand(@"
                SELECT username FROM [dbo].[User]
                WHERE  email  = @em
                  AND  status != 'Deleted'",
                db.GetOpenConnection()))
            {
                cmd.Parameters.AddWithValue("@em", email);
                object scalar = cmd.ExecuteScalar();
                if (scalar != null) username = scalar.ToString();
            }

            if (username == null)
            {
                res.StatusCode = 200;
                res.Message = safeMsg;
                return res;
            }

            // ── 2. Generate 6-digit OTP and store it ──────────────────────
            string code = new Random().Next(100000, 999999).ToString();

            using (DBconnect db = new DBconnect())
            using (SqlCommand cmd = new SqlCommand(@"
                -- Invalidate all previous unused codes for this email
                UPDATE [dbo].[PasswordResetCodes]
                SET    used = 1
                WHERE  email = @em AND used = 0;

                -- Insert the new code (expires in 10 minutes)
                INSERT INTO [dbo].[PasswordResetCodes]
                    (email, code, expires_at)
                VALUES
                    (@em, @code, DATEADD(MINUTE, 10, GETDATE()));",
                db.GetOpenConnection()))
            {
                cmd.Parameters.AddWithValue("@em", email);
                cmd.Parameters.AddWithValue("@code", code);
                cmd.ExecuteNonQuery();
            }

            // ── 3. Email the OTP (EmailHelper is in BusinessLayer) ────────
            EmailHelper.SendPasswordResetCode(email, username, code);

            res.StatusCode = 200;
            res.Message = safeMsg;
            return res;
        }

        // ═══════════════════════════════════════════════════════════════════
        //  FORGOT PASSWORD — Step 2: Verify OTP
        // ═══════════════════════════════════════════════════════════════════
        public Response VerifyResetCode(string email, string code)
        {
            Response res = new Response();
            bool valid = CheckResetCode(email, code);

            res.StatusCode = valid ? 200 : 400;
            res.Message = valid ? "Code verified" : "Invalid or expired code";
            return res;
        }

        // ═══════════════════════════════════════════════════════════════════
        //  FORGOT PASSWORD — Step 3: Reset Password
        // ═══════════════════════════════════════════════════════════════════
        public Response ResetPassword(string email, string code, string newPasswordHash)
        {
            Response res = new Response();

            // Re-verify the OTP before changing anything
            if (!CheckResetCode(email, code))
            {
                res.StatusCode = 400;
                res.Message = "Invalid or expired code";
                return res;
            }

            using (DBconnect db = new DBconnect())
            {
                SqlConnection conn = db.GetOpenConnection();

                // ── Update the password ───────────────────────────────────
                using (SqlCommand cmd = new SqlCommand(@"
                    UPDATE [dbo].[User]
                    SET    password_hash = @pw,
                           updated_date  = GETDATE()
                    WHERE  email  = @em
                      AND  status != 'Deleted'", conn))
                {
                    cmd.Parameters.AddWithValue("@pw", newPasswordHash);
                    cmd.Parameters.AddWithValue("@em", email);

                    int rows = cmd.ExecuteNonQuery();
                    if (rows == 0)
                    {
                        res.StatusCode = 400;
                        res.Message = "User not found";
                        return res;
                    }
                }

                // ── Mark OTP as used so it cannot be replayed ─────────────
                using (SqlCommand cmd = new SqlCommand(@"
                    UPDATE [dbo].[PasswordResetCodes]
                    SET    used = 1
                    WHERE  email = @em AND code = @code", conn))
                {
                    cmd.Parameters.AddWithValue("@em", email);
                    cmd.Parameters.AddWithValue("@code", code);
                    cmd.ExecuteNonQuery();
                }
            }

            res.StatusCode = 200;
            res.Message = "Password reset successfully";
            return res;
        }

        // ═══════════════════════════════════════════════════════════════════
        //  PRIVATE HELPERS
        // ═══════════════════════════════════════════════════════════════════

        /// <summary>Maps an open SqlDataReader row to a UserModel.</summary>
        private static UserModel MapUser(SqlDataReader r) => new UserModel
        {
            userId = SafeCol(r, "userId"),
            username = SafeCol(r, "username"),
            email = SafeCol(r, "email"),
            phone = SafeCol(r, "phone"),
            status = SafeCol(r, "status"),
            roleId = SafeCol(r, "roleId"),
            created_date = SafeCol(r, "created_date"),
            created_by = SafeCol(r, "created_by"),
            updated_date = SafeCol(r, "updated_date"),
            updated_by = SafeCol(r, "updated_by"),
        };

        /// <summary>Reads a column by name without throwing if the column is absent.</summary>
        private static string SafeCol(SqlDataReader r, string col)
        {
            try { return r[col]?.ToString(); }
            catch { return null; }
        }

        /// <summary>Checks the PasswordResetCodes table for a valid, unexpired, unused code.</summary>
        private static bool CheckResetCode(string email, string code)
        {
            using (DBconnect db = new DBconnect())
            using (SqlCommand cmd = new SqlCommand(@"
                SELECT COUNT(*)
                FROM   [dbo].[PasswordResetCodes]
                WHERE  email      = @em
                  AND  code       = @code
                  AND  used       = 0
                  AND  expires_at > GETDATE()",
                db.GetOpenConnection()))
            {
                cmd.Parameters.AddWithValue("@em", email);
                cmd.Parameters.AddWithValue("@code", code);
                return (int)cmd.ExecuteScalar() > 0;
            }
        }
    }
}