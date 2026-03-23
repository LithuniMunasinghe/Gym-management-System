using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GymManagement.Models
{
    public class SubscriptionModel
    {
        public string subscriptionId { get; set; }
        public string memberId { get; set; }
        public string planId { get; set; }
        public string startDate { get; set; }
        public string end_date { get; set; }
        public string is_active { get; set; }

    }
}