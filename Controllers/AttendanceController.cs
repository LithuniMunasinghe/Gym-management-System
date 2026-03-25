using System.Web.Mvc;
using GymManagement.Interfaces;

namespace GymManagement.Controllers
{
    public class AttendanceController : Controller
    {
        private readonly IAttendance _attendanceDA;
        public AttendanceController(IAttendance attendanceDA) { _attendanceDA = attendanceDA; }

        // POST /Attendance/TapCard — RFID check-in/out
        [HttpPost]
        public ActionResult TapCard(string rfidNo)
            => Json(_attendanceDA.MarkAttendance(rfidNo));

        // GET /Attendance/GetMemberAttendance?memberId=5
        [HttpGet]
        public ActionResult GetMemberAttendance(string memberId)
            => Json(_attendanceDA.GetMemberAttendance(memberId), JsonRequestBehavior.AllowGet);

        // GET /Attendance/GetAll — Admin view
        [HttpGet]
        public ActionResult GetAll()
            => Json(_attendanceDA.GetMemberAttendance(null), JsonRequestBehavior.AllowGet);
    }
}
