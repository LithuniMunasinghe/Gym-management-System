using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using WebApplication1.Interfaces;
using WebApplication1.Models;

namespace GymManagement.Controllers
{
    public class UserController : Controller
    {

        private readonly IUser _User;

        public UserController(IUser user)
        {
            _User = user;
        }

        [HttpGet]
        public ActionResult GetAllUsers()
        {
            var result = _User.GetAllUsers();
            return Json(result, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public ActionResult GetUser(int id)
        {
            var result = _User.SelectById(id);
            return Json(result, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult DeleteUser(int id, string currentUserId)
        {
            if (!_User.IsAdmin(currentUserId))
                return Json(new { StatusCode = 403, Message = "Unauthorized" });
            var result = _User.DeleteUserById(id, currentUserId);
            return Json(result);
        }

        [HttpPost]
        public ActionResult EditUserById(UserModel user, string currentUserId)
        {
            if (!_User.IsAdmin(currentUserId))
                return Json(new { StatusCode = 403, Message = "Unauthorized" });
            var result = _User.EditUserById(user, currentUserId);
            return Json(result);
        }

        [HttpPost]
        public ActionResult AddUser(UserModel user, string currentUserId)
        {
            if (!_User.IsAdmin(currentUserId))
                return Json(new { StatusCode = 403, Message = "Unauthorized: Only Admins can add users" });
            var result = _User.AddUser(user, currentUserId);
            return Json(result);
        }

        // ── LOGIN (public) ────────────────────────────────────────────────
        [HttpPost]
        public ActionResult Login(string username, string password)
        {
            var result = _User.Login(username, password);
            return Json(result, JsonRequestBehavior.AllowGet);
        }

        // ── OAUTH LOGIN (public) ──────────────────────────────────────────
        [HttpPost]
        public ActionResult OAuthLogin(string providerName, string providerUserId,
                                       string email, string name)
        {
            var result = _User.OAuthLogin(providerName, providerUserId, email, name);
            return Json(result, JsonRequestBehavior.AllowGet);
        }

        // ── FORGOT PASSWORD Step 1 (public) ──────────────────────────────
        [HttpPost]
        public ActionResult ForgotPassword(string email)
        {
            var result = _User.RequestPasswordReset(email);
            return Json(result, JsonRequestBehavior.AllowGet);
        }

        // ── FORGOT PASSWORD Step 2 (public) ──────────────────────────────
        [HttpPost]
        public ActionResult VerifyResetCode(string email, string code)
        {
            var result = _User.VerifyResetCode(email, code);
            return Json(result, JsonRequestBehavior.AllowGet);
        }

        // ── FORGOT PASSWORD Step 3 (public) ──────────────────────────────
        [HttpPost]
        public ActionResult ResetPassword(string email, string code, string newPassword)
        {
            var result = _User.ResetPassword(email, code, newPassword);
            return Json(result, JsonRequestBehavior.AllowGet);
        }
    }
}