using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GymManagement.Models
{
    public class TrainerAssignmentModel
    {

        public string assignmentId { get; set; }
        public string trainer_Id { get; set; }
        public string memberId { get; set; }
        public string assignment_date { get; set; }
       
    }
}