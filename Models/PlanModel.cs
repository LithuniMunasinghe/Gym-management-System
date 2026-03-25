using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GymManagement.Models
{
    public class PlanModel
    {
   
        public string planId  { get; set; }
        public string planType { get; set; }
        public string price { get; set; }
        public string duration_days { get; set; }

    }
}