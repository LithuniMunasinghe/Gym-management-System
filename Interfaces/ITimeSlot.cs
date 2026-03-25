using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using GymManagement.Models;

namespace GymManagement.Interfaces
{
    public interface ITimeSlot
    {
        Response GetAllTimeslots();
        Response GetTimeslotsByTrainer(string trainerId);
        Response AddTimeslot(TimeslotModel model);
        Response DeleteTimeslot(string timeslotId);
        Response UpdateAvailability(string timeslotId, string isAvailable);
    }
}
