using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using GymManagement.Models;

namespace GymManagement.Interfaces
{
    public interface ITrainerAssignment
    {
        Response GetAllAssignments();
        Response GetAssignmentsByMember(string memberId);
        Response GetAssignmentsByTrainer(string trainerId);
        Response AddAssignment(TrainerAssignmentModel model);
        Response DeleteAssignment(string assignmentId);
    }
}
