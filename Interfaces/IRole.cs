using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using GymManagement.Models;

namespace GymManagement.Interfaces
{
    public interface IRole
    {
        bool IsAdmin(string userId);
        Response GetAllRole(string userId);
        Response AddRoleByAdmin(RoleModel role, string roleName);
    }
}
