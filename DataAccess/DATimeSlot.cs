using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Web;
using GymManagement.Database_Layer;
using GymManagement.Models;
using GymManagement.Interfaces;

namespace GymManagement.DataAccess
{
    public class DATimeSlot : ITimeSlot
    {
        public Response AddTimeslot(TimeslotModel model)
        {
            Response res = new Response();
            // Automatically calculate endTime as startTime + 2 hours
            string query = @"INSERT INTO Timeslot (trainer_Id, day_of_week, startTime, endTime, isAvailable) 
                            VALUES (@tid, @day, @start, DATEADD(hour, 2, @start), 1)";

            using (DBconnect db = new DBconnect())
            using (SqlCommand cmd = new SqlCommand(query, db.GetOpenConnection()))
            {
                cmd.Parameters.AddWithValue("@tid", model.trainer_Id);
                cmd.Parameters.AddWithValue("@day", model.day_of_week);
                cmd.Parameters.AddWithValue("@start", model.startTime);

                int rows = cmd.ExecuteNonQuery();
                res.StatusCode = rows > 0 ? 200 : 400;
                res.Message = rows > 0 ? "Timeslot assigned with 2hr duration" : "Failed";
            }
            return res;
        }

        public Response GetAllTimeslots()
        {
            Response res = new Response();
            List<TimeslotModel> list = new List<TimeslotModel>();
            string query = "SELECT * FROM dbo.Timeslot";

            using (DBconnect db = new DBconnect())
            using (SqlDataReader reader = db.ReadTable(query))
            {
                while (reader.Read())
                {
                    list.Add(new TimeslotModel
                    {
                        timeslot_Id = reader["timeslot_Id"].ToString(),
                        trainer_Id = reader["trainer_Id"].ToString(),
                        day_of_week = reader["day_of_week"].ToString(),
                        startTime = reader["startTime"].ToString(),
                        endTime = reader["endTime"].ToString(),
                        isAvailable = reader["isAvailable"].ToString()
                    });
                }
            }
            res.ResultList = list;
            res.StatusCode = 200;
            return res;
        }

        public Response GetTimeslotsByTrainer(string trainerId)
        {
            Response res = new Response();
            List<TimeslotModel> list = new List<TimeslotModel>();
            string query = "SELECT * FROM Timeslot WHERE trainer_Id = @tid";

            using (DBconnect db = new DBconnect())
            using (SqlCommand cmd = new SqlCommand(query, db.GetOpenConnection()))
            {
                cmd.Parameters.AddWithValue("@tid", trainerId);
                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        list.Add(new TimeslotModel
                        {
                            timeslot_Id = reader["timeslot_Id"].ToString(),
                            trainer_Id = reader["trainer_Id"].ToString(),
                            day_of_week = reader["day_of_week"].ToString(),
                            startTime = reader["startTime"].ToString(),
                            endTime = reader["endTime"].ToString(),
                            isAvailable = reader["isAvailable"].ToString()
                        });
                    }
                }
            }
            res.ResultList = list;
            res.StatusCode = list.Count > 0 ? 200 : 404;
            return res;
        }

        public Response DeleteTimeslot(string timeslotId)
        {
            Response res = new Response();
            string query = "DELETE FROM Timeslot WHERE timeslot_Id = @id";
            using (DBconnect db = new DBconnect())
            using (SqlCommand cmd = new SqlCommand(query, db.GetOpenConnection()))
            {
                cmd.Parameters.AddWithValue("@id", timeslotId);
                int rows = cmd.ExecuteNonQuery();
                res.StatusCode = rows > 0 ? 200 : 400;
                return res;
            }
        }

        public Response UpdateAvailability(string timeslotId, string isAvailable)
        {
            Response res = new Response();
            string query = "UPDATE Timeslot SET isAvailable = @status WHERE timeslot_Id = @id";
            using (DBconnect db = new DBconnect())
            using (SqlCommand cmd = new SqlCommand(query, db.GetOpenConnection()))
            {
                cmd.Parameters.AddWithValue("@status", isAvailable == "1" ? 1 : 0);
                cmd.Parameters.AddWithValue("@id", timeslotId);
                int rows = cmd.ExecuteNonQuery();
                res.StatusCode = rows > 0 ? 200 : 400;
                return res;
            }
        }
    }
}