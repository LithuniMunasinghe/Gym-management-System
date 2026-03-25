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
    public class DAPayment : IPayment
    {
        public Response AddPayment(PaymentModel model)
        {
            Response res = new Response();
            // payment_date and payment_Status have SQL DEFAULTS
            string query = @"INSERT INTO Payment (paymentAmount, subscriptionId) 
                            VALUES (@amount, @sid)";

            using (DBconnect db = new DBconnect())
            using (SqlCommand cmd = new SqlCommand(query, db.GetOpenConnection()))
            {
                cmd.Parameters.AddWithValue("@amount", decimal.Parse(model.paymentAmount));
                cmd.Parameters.AddWithValue("@sid", model.subscriptionId);

                try
                {
                    int rows = cmd.ExecuteNonQuery();
                    res.StatusCode = rows > 0 ? 200 : 400;
                    res.Message = "Payment recorded successfully";
                }
                catch (SqlException ex)
                {
                    // This catches the UNIQUE constraint error if payment exists
                    res.StatusCode = 409;
                    res.Message = "Error: Payment already exists for this subscription.";
                }
            }
            return res;
        }

        public Response GetAllPayments()
        {
            Response res = new Response();
            List<PaymentModel> list = new List<PaymentModel>();
            string query = "SELECT * FROM Payment";

            using (DBconnect db = new DBconnect())
            using (SqlDataReader reader = db.ReadTable(query))
            {
                while (reader.Read())
                {
                    list.Add(new PaymentModel
                    {
                        paymentId = reader["paymentId"].ToString(),
                        payment_date = reader["payment_date"].ToString(),
                        paymentAmount = reader["paymentAmount"].ToString(),
                        payment_Status = reader["payment_Status"].ToString(),
                        subscriptionId = reader["subscriptionId"].ToString()
                    });
                }
            }
            res.ResultList = list;
            res.StatusCode = 200;
            return res;
        }

        public Response GetPaymentBySubscription(string subscriptionId)
        {
            Response res = new Response();
            string query = "SELECT * FROM Payment WHERE subscriptionId = @sid";
            using (DBconnect db = new DBconnect())
            using (SqlCommand cmd = new SqlCommand(query, db.GetOpenConnection()))
            {
                cmd.Parameters.AddWithValue("@sid", subscriptionId);
                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    if (reader.Read())
                    {
                        res.ResultList = new List<PaymentModel> {
                            new PaymentModel {
                                paymentId = reader["paymentId"].ToString(),
                                paymentAmount = reader["paymentAmount"].ToString(),
                                payment_Status = reader["payment_Status"].ToString()
                            }
                        };
                        res.StatusCode = 200;
                    }
                    else { res.StatusCode = 404; }
                }
            }
            return res;
        }

        public Response UpdatePaymentStatus(string paymentId, string status)
        {
            Response res = new Response();
            string query = "UPDATE Payment SET payment_Status = @status WHERE paymentId = @pid";
            using (DBconnect db = new DBconnect())
            using (SqlCommand cmd = new SqlCommand(query, db.GetOpenConnection()))
            {
                cmd.Parameters.AddWithValue("@status", status);
                cmd.Parameters.AddWithValue("@pid", paymentId);
                int rows = cmd.ExecuteNonQuery();
                res.StatusCode = rows > 0 ? 200 : 400;
            }
            return res;
        }

        public Response UpdatePaymentStatusBySubscription(string subscriptionId, string status)
        {
            Response res = new Response();
            string query = "UPDATE Payment SET payment_Status = @status WHERE subscriptionId = @sid";
            // ... (Your existing DB connection logic)
            return res;
        }
    }
}