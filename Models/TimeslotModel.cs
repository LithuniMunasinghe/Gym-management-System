using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GymManagement.Models
{
    public class TimeslotModel
    {

        public string timeslot_Id { get; set; }
        public string trainer_Id { get; set; }
        public string day_of_week { get; set; }
        public string startTime { get; set; }
        public string endTime { get; set; }
        public string isAvailable { get; set; }

    }
}
