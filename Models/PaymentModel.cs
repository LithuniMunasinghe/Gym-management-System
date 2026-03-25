using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GymManagement.Models
{
    public class PaymentModel
    {

        public string paymentId { get; set; }
        public string payment_date { get; set; }
        public string paymentAmount { get; set; }
        public string payment_Status { get; set; }
        public string subscriptionId { get; set; }

    }
}
