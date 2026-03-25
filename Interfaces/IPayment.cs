using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using GymManagement.Models;

namespace GymManagement.Interfaces
{
    public interface IPayment
    {
        Response GetAllPayments();
        Response GetPaymentBySubscription(string subscriptionId);
        Response AddPayment(PaymentModel model);
        Response UpdatePaymentStatus(string paymentId, string status);
        Response UpdatePaymentStatusBySubscription(string subscriptionId, string status);
    }
}
