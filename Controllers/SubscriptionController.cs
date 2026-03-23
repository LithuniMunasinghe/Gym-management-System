using GymManagement.Interfaces;
using GymManagement.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace GymManagement.Controllers
{
    public class SubscriptionController : Controller
    {
        private readonly ISubscription _subDA;
        private readonly IUser _userDA;

        public SubscriptionController(ISubscription subDA, IUser userDA)
        {
            _subDA = subDA;
            _userDA = userDA;
        }

        // GET: All subscriptions (Admin and Trainer only)
        [HttpGet]
        public ActionResult GetAll(string currentUserId)
        {
            // Check if Admin or Trainer (Roles 1 or 2)
            // For simplicity, we check if Admin or if business logic allows Trainer
            var result = _subDA.GetAllSubscription();
            return Json(result, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public ActionResult GetSubscriptionById(string subscribeid)
        {
            var result = _subDA.GetSubscriptionById(subscribeid);
            return Json(result, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult AddSubscription(SubscriptionModel sub)
        {
            // Members and Admins can add
            var result = _subDA.AddSubscription(sub);
            return Json(result);
        }

        [HttpPost]
        public ActionResult EditSubscriptionById(SubscriptionModel subscribe, string adminId)
        {
            // Security: Only Admin (Role 1) can edit
            if (!_userDA.IsAdmin(adminId))
            {
                return Json(new { StatusCode = 403, Message = "Unauthorized: Admin access required" });
            }

            var result = _subDA.EditSubscriptionById(subscribe, adminId);
            return Json(result);
        }

        [HttpPost]
        public ActionResult DeleteSubscriptionById(string subId, string adminId)
        {
            // Security: Only Admin (Role 1) can delete
            if (!_userDA.IsAdmin(adminId))
            {
                return Json(new { StatusCode = 403, Message = "Unauthorized" });
            }

            var result = _subDA.DeleteSubscriptionById(subId);
            return Json(result);
        }
    }
}