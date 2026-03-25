using GymManagement.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using GymManagement.Interfaces;
using GymManagement.Models;

namespace GymManagement.Controllers
{
    public class RoleController : Controller
    {
        private readonly IRole _Role;
        private readonly IUser _User;

        // Public Constructor
        public RoleController(IRole role, IUser user)
        {
            _Role = role;
            _User = user;
        }

        //GET All for Admin
        [HttpGet]
        public ActionResult GetAllRole(string adminId)
        {
            if (!_User.IsAdmin(adminId))
            {
                return Json(new { StatusCode = 403, Message = "Unauthorized" });
            }
            else
            {
                var result = _Role.GetAllRole(adminId);
                return Json(result, JsonRequestBehavior.AllowGet);
            }

        }

        [HttpPost]
        public ActionResult AddRoleByAdmin(string userId, string roleName, RoleModel role)
        {
            if (!_User.IsAdmin(userId))
            {
                return Json(new { StatusCode = 403, Message = "Unauthorized" });
            }
            else
            {
                var result = _Role.AddRoleByAdmin(role, roleName);
                return Json(result);
            }
        }
    }
}