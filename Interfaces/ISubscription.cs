using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using GymManagement.Models;

namespace GymManagement.Interfaces
{
    public interface ISubscription
    {
        Response GetSubscriptionById(string subscribeid);

        Response EditSubscriptionById(SubscriptionModel subscribe, string adminId);

        Response AddSubscription(SubscriptionModel sub);

        Response GetAllSubscription();

        Response DeleteSubscriptionById(string subId);
    }
}
