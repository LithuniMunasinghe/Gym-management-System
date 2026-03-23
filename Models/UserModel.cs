using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GymManagement.Models
{
    public class UserModel
    {
        public string userId { get; set; }
        public string username { get; set; }
        public string email  { get; set; }
        public string phone { get; set; }
        public string password_hash { get; set; }
        public string created_date { get; set; }
        public string created_by { get; set; }
        public string updated_date { get; set; }
        public string updated_by { get; set; }
        public string status { get; set; }
        public string roleId { get; set; }
    }
}