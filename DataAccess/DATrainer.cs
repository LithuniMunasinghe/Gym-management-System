using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Web;
using GymManagement.Interfaces;
using GymManagement.Models;
using GymManagement.Database_Layer;

namespace GymManagement.DataAccess
{
    public class DATrainer : ITrainer
    {
        //ADD 
        public Response AddTrainerUser(UserModel user, string adminId)
        {
            Response res = new Response();
            // We insert into [User] with RoleId 2. SQL Trigger handles the Trainer table.
            string query = @"INSERT INTO [dbo].[User] 
                            (username, email, password_hash, roleId, status, created_by, created_date) 
                            VALUES (@un, @em, @pw, 2, 'Active', @admin, GETDATE())";

            using (DBconnect db = new DBconnect())
            using (SqlCommand cmd = new SqlCommand(query, db.GetOpenConnection()))
            {
                cmd.Parameters.AddWithValue("@un", user.username);
                cmd.Parameters.AddWithValue("@em", user.email);
                cmd.Parameters.AddWithValue("@pw", user.password_hash);
                cmd.Parameters.AddWithValue("@admin", Convert.ToInt32(adminId));

                int rows = cmd.ExecuteNonQuery();
                res.StatusCode = rows > 0 ? 200 : 400;
                res.Message = rows > 0 ? "Trainer User Created. Trigger should fire now." : "Failed";
            }
            return res;
        }

        //EDIT 
        public Response EditTrainer(TrainerModel trainer, string currentLoggedInId)
        {
            Response res = new Response();
            // Use @tnid for trainer_Id to avoid parameter naming conflicts
            string query = @"UPDATE Trainer 
                            SET specialization = @spec, experience_years = @exp 
                            WHERE trainer_Id = @tnid";

            using (DBconnect db = new DBconnect())
            using (SqlCommand cmd = new SqlCommand(query, db.GetOpenConnection()))
            {
                cmd.Parameters.AddWithValue("@tnid", Convert.ToInt32(trainer.trainer_Id));
                cmd.Parameters.AddWithValue("@spec", trainer.specialization);
                cmd.Parameters.AddWithValue("@exp", Convert.ToInt32(trainer.experience_years));

                int rows = cmd.ExecuteNonQuery();
                res.StatusCode = rows > 0 ? 200 : 400;
                res.Message = rows > 0 ? "Trainer Updated Successfully" : "Update Failed";
            }
            return res;
        }

        //Get All Trainers
        public Response GetAllTrainer()
        {
            Response res = new Response();
            List<TrainerModel> userList = new List<TrainerModel>();
            string query = "SELECT trainer_Id ,specialization, experience_years FROM dbo.Trainer ";

            using (DBconnect db = new DBconnect())
            using (SqlDataReader reader = db.ReadTable(query))
            {
                while (reader.Read())
                {
                    userList.Add(new TrainerModel
                    {
                        trainer_Id = reader["trainer_Id"].ToString(),
                        specialization = reader["specialization"].ToString(),
                        experience_years = reader["experience_years"].ToString(),
                        

                    });
                }
            }

            res.StatusCode = 200;
            res.ResultList = userList;
            res.Message = "Success";
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