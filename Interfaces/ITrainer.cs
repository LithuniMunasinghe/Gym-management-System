using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using GymManagement.Models;

namespace GymManagement.Interfaces
{
    public interface ITrainer
    {
        bool IsAdmin(string userId);
        Response AddTrainerUser(UserModel user, string adminId);
        Response EditTrainer(TrainerModel trainer, string currentLoggedInId);
        Response GetAllTrainer();
    }
}
