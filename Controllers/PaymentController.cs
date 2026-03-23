using GymManagement.DataAccess;
using GymManagement.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace GymManagement.Controllers
{
    public class PaymentController : Controller
    {
        private readonly IPayment _paymentDA;
        private readonly IUser _userDA;

        public PaymentController(IPayment paymentDA, IUser userDA)
        {
            _paymentDA = paymentDA;
            _userDA = userDA;
        }

        [HttpGet]
        public ActionResult Index()
        {
            return Json(_paymentDA.GetAllPayments(), JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult ProcessPayment(PaymentModel model)
        {
            return Json(_paymentDA.AddPayment(model));
        }

        [HttpPost]
        public ActionResult RefundPayment(string paymentId, string adminId)
        {
            // Only Admin (Role 1) can change payment status
            if (!_userDA.IsAdmin(adminId))
                return Json(new { StatusCode = 403, Message = "Unauthorized" });

            return Json(_paymentDA.UpdatePaymentStatus(paymentId, "Refunded"));
        }
    }
}