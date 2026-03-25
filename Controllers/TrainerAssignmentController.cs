using GymManagement.Interfaces;
using GymManagement.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace GymManagement.Controllers
{
    public class TrainerAssignmentController : Controller
    {
        private readonly ITrainerAssignment _assignDA;
        private readonly IUser _userDA;

        // Constructor name matches class name to avoid CS1520
        public TrainerAssignmentController(ITrainerAssignment assignDA, IUser userDA)
        {
            _assignDA = assignDA;
            _userDA = userDA;
        }

        [HttpGet]
        public ActionResult Index()
        {
            return Json(_assignDA.GetAllAssignments(), JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult AssignTrainer(TrainerAssignmentModel model, string adminId)
        {
            // Security: Only Admin (Role 1) can assign
            if (!_userDA.IsAdmin(adminId))
                return Json(new { StatusCode = 403, Message = "Access Denied: Admin only" });

            return Json(_assignDA.AddAssignment(model));
        }

        [HttpPost]
        public ActionResult RemoveAssignment(string assignmentId, string adminId)
        {
            if (!_userDA.IsAdmin(adminId))
                return Json(new { StatusCode = 403, Message = "Access Denied" });

            return Json(_assignDA.DeleteAssignment(assignmentId));
        }

        [HttpGet]
        public ActionResult MyTrainer(string memberId)
        {
            // Members can view who is assigned to them
            return Json(_assignDA.GetAssignmentsByMember(memberId), JsonRequestBehavior.AllowGet);
        }
    }
}