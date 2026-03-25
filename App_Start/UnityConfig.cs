using GymManagement.DataAccess;
using GymManagement.Interfaces;
using Microsoft.Ajax.Utilities;
using System.Web.Mvc;
using Unity;
using Unity.Mvc5;

namespace GymManagement
{
    public static class UnityConfig
    {
        public static void RegisterComponents()
        {
			var container = new UnityContainer();

            // register all your components with the container here
            // it is NOT necessary to register your controllers
            container.RegisterType<IUser, DAUser>();
            //container.RegisterType<IMember, DAMember>();
            container.RegisterType<ITrainer, DATrainer>();
            container.RegisterType<IRole, DARole>();
           //container.RegisterType<IPlan, DAPlan>();
            container.RegisterType<ITimeSlot, DATimeSlot>();
            //container.RegisterType<IWorkoutSessionExercise, DAWorkoutSessionExercise>();
            container.RegisterType<ITrainerAssignment, DATrainerAssignment>();
           // container.RegisterType<IRFIDTag, DARFIDTag>();
           // container.RegisterType<IAttendance, DAAttendance>();
            container.RegisterType<ISubscription, DASubscription>();
            //container.RegisterType<ISchedul, DASchedul>();
            container.RegisterType<IPayment, DAPayment>();

            // e.g. container.RegisterType<ITestService, TestService>();

            DependencyResolver.SetResolver(new UnityDependencyResolver(container));
        }
    }
}