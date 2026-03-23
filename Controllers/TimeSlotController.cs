using GymManagement.Interfaces;
using GymManagement.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace GymManagement.Controllers
{
    public class TimeSlotController : Controller
    {
        private readonly ITimeSlot _timeslotDA;
        private readonly IUser _userDA;

        public TimeSlotController(ITimeSlot timeslotDA, IUser userDA)
        {
            _timeslotDA = timeslotDA;
            _userDA = userDA;
        }

        [HttpGet]
        public ActionResult GetTrainerSlots(string trainerId)
        {
            return Json(_timeslotDA.GetTimeslotsByTrainer(trainerId), JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult AddSlot(TimeslotModel model)
        {
            // Trainer selects a slot; it assigns their ID
            return Json(_timeslotDA.AddTimeslot(model));
        }

        [HttpPost]
        public ActionResult ToggleAvailability(string timeslotId, string status, string adminId)
        {
            // Only Admins can manually override availability if needed
            if (!_userDA.IsAdmin(adminId))
                return Json(new { StatusCode = 403, Message = "Unauthorized" });

            return Json(_timeslotDA.UpdateAvailability(timeslotId, status));
        }
    }
}