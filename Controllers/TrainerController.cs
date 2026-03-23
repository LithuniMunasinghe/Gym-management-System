using GymManagement.DataAccess;
using GymManagement.Interfaces;
using GymManagement.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace GymManagement.Controllers
{
    public class TrainerController : Controller
    {
        private readonly ITrainer _trainerDA;
        private readonly IUser _User;

        // Public Constructor
        public TrainerController(IUser user)
        {
            _trainerDA = new DATrainer();
            _User = user;
        }

        [HttpPost]
        public ActionResult AddTrainer(UserModel user, string adminId)
        {
            // Only Admin can create a Trainer
            if (!_User.IsAdmin(adminId))
                return Json(new { StatusCode = 403, Message = "Unauthorized" });

            return Json(_trainerDA.AddTrainerUser(user, adminId));
        }

        [HttpPost]
        public ActionResult EditTrainer(TrainerModel trainer, string currentLoggedInId)
        {
            // Admin or Self-Edit logic
            bool isOwner = (currentLoggedInId == trainer.trainer_Id);

            if (!_User.IsAdmin(currentLoggedInId) && !isOwner)
                return Json(new { StatusCode = 403, Message = "Access Denied: You can only edit your own data." });

            return Json(_trainerDA.EditTrainer(trainer, currentLoggedInId));
        }

        [HttpGet]
        public ActionResult GetAllTrainer()
        {
            var result = _trainerDA.GetAllTrainer();
            return Json(result, JsonRequestBehavior.AllowGet);
        }
    }
}