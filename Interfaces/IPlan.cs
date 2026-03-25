using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using GymManagement.Models;

namespace GymManagement.Interfaces
{
    public interface IPlan
    {
       // bool IsAdmin(string userId);
        Response GetAllPlans();
       // Response AddPlanByAdmin(PlanModel plan, string adminId);
       // Response GetplanById(string planId , string adminId);
       // Response EditPlanById(PlanModel plan, string adminId);
       // Response DeletePlanById(string planId, string adminId);
    }
}
