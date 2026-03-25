using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using GymManagement.Interfaces;
using GymManagement.Models;
using GymManagement.Database_Layer;

namespace GymManagement.DataAccess
{
    public class DASubscription : ISubscription
    {
        public Response GetAllSubscription()
        {
            Response res = new Response();
            List<SubscriptionModel> list = new List<SubscriptionModel>();
            string query = "SELECT * FROM Subscription";

            using (DBconnect db = new DBconnect())
            using (SqlDataReader reader = db.ReadTable(query))
            {
                while (reader.Read())
                {
                    list.Add(new SubscriptionModel
                    {
                        subscriptionId = reader["subscriptionId"].ToString(),
                        memberId = reader["memberId"].ToString(),
                        planId = reader["planId"].ToString(),
                        startDate = reader["startDate"].ToString(),
                        end_date = reader["end_date"].ToString(),
                        is_active = reader["is_active"].ToString()
                    });
                }
            }
            res.StatusCode = 200;
            res.ResultList = list;
            res.Message = "Success";
            return res;
        }

        public Response GetSubscriptionById(string subscribeid)
        {
            Response res = new Response();
            SubscriptionModel sub = null;
            string query = "SELECT * FROM Subscription WHERE subscriptionId = @id";

            using (DBconnect db = new DBconnect())
            using (SqlCommand cmd = new SqlCommand(query, db.GetOpenConnection()))
            {
                cmd.Parameters.AddWithValue("@id", subscribeid);
                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    if (reader.Read())
                    {
                        sub = new SubscriptionModel
                        {
                            subscriptionId = reader["subscriptionId"].ToString(),
                            memberId = reader["memberId"].ToString(),
                            planId = reader["planId"].ToString(),
                            startDate = reader["startDate"].ToString(),
                            end_date = reader["end_date"].ToString(),
                            is_active = reader["is_active"].ToString()
                        };
                    }
                }
            }
            res.ResultList = sub != null ? new List<SubscriptionModel> { sub } : null;
            res.StatusCode = sub != null ? 200 : 404;
            return res;
        }

        public Response AddSubscription(SubscriptionModel sub)
        {
            Response res = new Response();
            // Automatically calculate end_date based on plan duration
            string query = @"
                DECLARE @days INT = (SELECT duration_days FROM Plans WHERE planId = @pid);
                INSERT INTO Subscription (memberId, planId, startDate, end_date, is_active)
                VALUES (@mid, @pid, GETDATE(), DATEADD(day, @days, GETDATE()), 1);
                SELECT SCOPE_IDENTITY();";

            using (DBconnect db = new DBconnect())
            using (SqlCommand cmd = new SqlCommand(query, db.GetOpenConnection()))
            {
                cmd.Parameters.AddWithValue("@mid", sub.memberId);
                cmd.Parameters.AddWithValue("@pid", sub.planId);
                object newId = cmd.ExecuteScalar();
                res.StatusCode = newId != null ? 200 : 400;
                res.Message = newId != null ? "Subscription created. Payment generated." : "Failed";
            }
            return res;
        }

        public Response EditSubscriptionById(SubscriptionModel subscribe, string adminId)
        {
            Response res = new Response();
            string query = @"
                DECLARE @days INT = (SELECT duration_days FROM Plans WHERE planId = @pid);
                UPDATE Subscription 
                SET planId = @pid, 
                    end_date = DATEADD(day, @days, startDate), 
                    is_active = @active
                WHERE subscriptionId = @sid";

            using (DBconnect db = new DBconnect())
            using (SqlCommand cmd = new SqlCommand(query, db.GetOpenConnection()))
            {
                cmd.Parameters.AddWithValue("@sid", subscribe.subscriptionId);
                cmd.Parameters.AddWithValue("@pid", subscribe.planId);
                cmd.Parameters.AddWithValue("@active", subscribe.is_active);
                int rows = cmd.ExecuteNonQuery();
                res.StatusCode = rows > 0 ? 200 : 400;
                res.Message = rows > 0 ? "Update Successful" : "Update Failed";
            }
            return res;
        }

        public Response DeleteSubscriptionById(string subId)
        {
            Response res = new Response();
            string query = "DELETE FROM Subscription WHERE subscriptionId = @id";

            using (DBconnect db = new DBconnect())
            using (SqlCommand cmd = new SqlCommand(query, db.GetOpenConnection()))
            {
                cmd.Parameters.AddWithValue("@id", subId);
                int rows = cmd.ExecuteNonQuery();
                res.StatusCode = rows > 0 ? 200 : 400;
                res.Message = rows > 0 ? "Deleted Successfully" : "Delete Failed";
            }
            return res;
        }
    }
}