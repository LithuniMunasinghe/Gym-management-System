using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using GymManagement.Interfaces;
using GymManagement.Models;
using GymManagement.Database_Layer;

namespace GymManagement.DataAccess
{
    // Fix: DARole must implement IRole directly
    public class DARole : IRole
    {
        public Response GetAllRole(string userId)
        {
            Response res = new Response();
            List<RoleModel> RoleList = new List<RoleModel>();
            string query = "SELECT roleId, roleName FROM dbo.Role WHERE roleId = 1";

            using (DBconnect db = new DBconnect())
            using (SqlDataReader reader = db.ReadTable(query))
            {
                while (reader.Read())
                {
                    RoleList.Add(new RoleModel
                    {
                        roleId = reader["roleId"].ToString(),
                        roleName = reader["roleName"].ToString(),
                    });
                }
            }

            res.StatusCode = 200;
            res.ResultList = RoleList;
            res.Message = "Success";
            return res;
        }

        //Add Role
        public Response AddRoleByAdmin(RoleModel role, string roleName)
        {
            Response res = new Response();
            List<RoleModel> RoleList = new List<RoleModel>();
            string query = "INSERT INTO dbo.Role (roleName) VALUES (@rn)";

            using (DBconnect db = new DBconnect())
            using (SqlCommand cmd = new SqlCommand(query, db.GetOpenConnection()))
            {
                cmd.Parameters.AddWithValue("@rn", role.roleName);

                int rows = cmd.ExecuteNonQuery();
                res.StatusCode = rows > 0 ? 200 : 400;
                res.Message = rows > 0 ? "User Added" : "Failed";
            }

            return res;
        }

        //check admin id using user table role column 
        public bool IsAdmin(string userId)
        {
            string query = "SELECT COUNT(*) FROM [dbo].[User] WHERE userId = @uid AND roleId = 1";

            using (DBconnect db = new DBconnect())
            using (SqlCommand cmd = new SqlCommand(query, db.GetOpenConnection()))
            {
                cmd.Parameters.AddWithValue("@uid", userId);
                int count = (int)cmd.ExecuteScalar();
                return count > 0;
            }
        }
    }
}