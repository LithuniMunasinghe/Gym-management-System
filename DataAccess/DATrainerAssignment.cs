using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Web;
using GymManagement.Database_Layer;
using GymManagement.Interfaces;
using GymManagement.Models;
namespace GymManagement.DataAccess
{
    public class DATrainerAssignment : ITrainerAssignment
    {
        public Response AddAssignment(TrainerAssignmentModel model)
        {
            Response res = new Response();
            // assignment_date is handled by DEFAULT GETDATE() in SQL
            string query = "INSERT INTO TrainerAssignment (trainer_Id, memberId) VALUES (@tid, @mid)";

            using (DBconnect db = new DBconnect())
            using (SqlCommand cmd = new SqlCommand(query, db.GetOpenConnection()))
            {
                cmd.Parameters.AddWithValue("@tid", model.trainer_Id);
                cmd.Parameters.AddWithValue("@mid", model.memberId);

                int rows = cmd.ExecuteNonQuery();
                res.StatusCode = rows > 0 ? 200 : 400;
                res.Message = rows > 0 ? "Trainer assigned to member successfully" : "Assignment failed";
            }
            return res;
        }

        public Response GetAllAssignments()
        {
            Response res = new Response();
            List<TrainerAssignmentModel> list = new List<TrainerAssignmentModel>();
            string query = "SELECT * FROM TrainerAssignment";

            using (DBconnect db = new DBconnect())
            using (SqlDataReader reader = db.ReadTable(query))
            {
                while (reader.Read())
                {
                    list.Add(new TrainerAssignmentModel
                    {
                        assignmentId = reader["assignmentId"].ToString(),
                        trainer_Id = reader["trainer_Id"].ToString(),
                        memberId = reader["memberId"].ToString(),
                        assignment_date = reader["assignment_date"].ToString()
                    });
                }
            }
            res.ResultList = list;
            res.StatusCode = 200;
            return res;
        }

        public Response GetAssignmentsByMember(string memberId)
        {
            Response res = new Response();
            List<TrainerAssignmentModel> list = new List<TrainerAssignmentModel>();
            string query = "SELECT * FROM TrainerAssignment WHERE memberId = @mid";

            using (DBconnect db = new DBconnect())
            using (SqlCommand cmd = new SqlCommand(query, db.GetOpenConnection()))
            {
                cmd.Parameters.AddWithValue("@mid", memberId);
                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        list.Add(new TrainerAssignmentModel
                        {
                            assignmentId = reader["assignmentId"].ToString(),
                            trainer_Id = reader["trainer_Id"].ToString(),
                            memberId = reader["memberId"].ToString(),
                            assignment_date = reader["assignment_date"].ToString()
                        });
                    }
                }
            }
            res.ResultList = list;
            res.StatusCode = 200;
            return res;
        }

        public Response GetAssignmentsByTrainer(string trainerId)
        {
            Response res = new Response();
            // Similar logic to GetAssignmentsByMember but filtering by trainer_Id
            return res;
        }

        public Response DeleteAssignment(string assignmentId)
        {
            Response res = new Response();
            string query = "DELETE FROM TrainerAssignment WHERE assignmentId = @id";
            using (DBconnect db = new DBconnect())
            using (SqlCommand cmd = new SqlCommand(query, db.GetOpenConnection()))
            {
                cmd.Parameters.AddWithValue("@id", assignmentId);
                int rows = cmd.ExecuteNonQuery();
                res.StatusCode = rows > 0 ? 200 : 400;
                return res;
            }
        }
    }
}